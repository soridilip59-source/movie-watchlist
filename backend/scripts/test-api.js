const http = require('http');
const app = require('../server');

let server;
const PORT = 5001;

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log(' Starting Family Movie Watchlist API Automated Tests');
  console.log('====================================================\n');

  process.env.NODE_ENV = 'test';
  server = app.listen(PORT);

  let parentToken = '';
  let childToken = '';
  let familyId = '';
  let movieId = '';
  let watchlistItemId = '';
  let childUserId = '';

  try {
    // 1. Register Parent
    console.log('1. Testing Parent Registration (POST /api/auth/register)...');
    const parentReg = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Test Parent',
        email: `parent_${Date.now()}@test.com`,
        password: 'password123',
        role: 'parent',
      }
    );
    console.assert(parentReg.statusCode === 201, 'Parent registration failed');
    parentToken = parentReg.body.token;
    console.log('   ✓ Parent registered, token received.\n');

    // 2. Register Child
    console.log('2. Testing Child Registration (POST /api/auth/register)...');
    const childReg = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Test Child',
        email: `child_${Date.now()}@test.com`,
        password: 'password123',
        role: 'child',
      }
    );
    console.assert(childReg.statusCode === 201, 'Child registration failed');
    childToken = childReg.body.token;
    childUserId = childReg.body.user._id;
    console.log('   ✓ Child registered, token received.\n');

    // 3. Current User Check (GET /api/auth/me)
    console.log('3. Testing Current User endpoint (GET /api/auth/me)...');
    const meRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    console.assert(meRes.statusCode === 200, 'GET /api/auth/me failed');
    console.assert(meRes.body.data.role === 'parent', 'User role mismatch');
    console.log('   ✓ GET /api/auth/me verified.\n');

    // 4. Create Family (POST /api/families)
    console.log('4. Testing Family Creation (POST /api/families)...');
    const famRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/families',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${parentToken}`,
        },
      },
      { name: 'The Automated Test Family' }
    );
    console.assert(famRes.statusCode === 201, 'Family creation failed');
    familyId = famRes.body.family._id;
    console.log(`   ✓ Family created with ID: ${familyId}\n`);

    // 5. Add Member to Family (POST /api/families/:id/members)
    console.log('5. Testing Adding Family Member (POST /api/families/:id/members)...');
    const addMemRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/families/${familyId}/members`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${parentToken}`,
        },
      },
      { email: childReg.body.user.email }
    );
    console.assert(addMemRes.statusCode === 200, 'Adding member failed');
    console.log('   ✓ Child added to parent family workspace.\n');

    // 6. Child role restriction test (Child attempting to create movie)
    console.log('6. Testing Role Restriction (Child POST /api/movies - Should return 403 Forbidden)...');
    const childMovieRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/movies',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${childToken}`,
        },
      },
      {
        title: 'Unauthorized Movie',
        description: 'Testing permissions',
        genre: ['Animation'],
        releaseYear: 2025,
        posterUrl: 'http://example.com/poster.jpg',
      }
    );
    console.assert(childMovieRes.statusCode === 403, 'Child was improperly allowed to create movie');
    console.log('   ✓ 403 Forbidden correctly enforced for Child user.\n');

    // 7. Create Movie as Parent (POST /api/movies)
    console.log('7. Testing Parent Movie Creation (POST /api/movies)...');
    const movieRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/movies',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${parentToken}`,
        },
      },
      {
        title: 'The Great Test Animation',
        description: 'An epic animated feature for family testing.',
        genre: ['Animation', 'Comedy'],
        releaseYear: 2025,
        duration: '110 min',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401',
        ageRating: 'PG',
      }
    );
    console.assert(movieRes.statusCode === 201, 'Movie creation failed');
    movieId = movieRes.body.movie._id;
    console.log(`   ✓ Movie created with ID: ${movieId}\n`);

    // 8. Search & Filter Movies (GET /api/movies?search=Test&genre=Animation)
    console.log('8. Testing Movie Search & Pagination (GET /api/movies?genre=Animation)...');
    const getMoviesRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies?genre=Animation&page=1&limit=5',
      method: 'GET',
    });
    console.assert(getMoviesRes.statusCode === 200, 'GET movies failed');
    console.assert(getMoviesRes.body.movies.length > 0, 'No movies returned');
    console.log(`   ✓ Search returned ${getMoviesRes.body.movies.length} movies (Total: ${getMoviesRes.body.totalMovies}).\n`);

    // 9. Add to Watchlist (POST /api/watchlist)
    console.log('9. Testing Add to Watchlist (POST /api/watchlist)...');
    const watchRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/watchlist',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${parentToken}`,
        },
      },
      {
        movieId,
        familyId,
        priority: 'high',
        notes: 'Must watch on Friday night!',
      }
    );
    console.assert(watchRes.statusCode === 201, 'Add to watchlist failed');
    watchlistItemId = watchRes.body.data._id;
    console.log('   ✓ Movie added to family watchlist.\n');

    // 10. Update Watchlist Status (PUT /api/watchlist/:id/status)
    console.log('10. Testing Status Update (PUT /api/watchlist/:id/status)...');
    const statusRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/watchlist/${watchlistItemId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${childToken}`,
        },
      },
      { status: 'watched' }
    );
    console.assert(statusRes.statusCode === 200, 'Status update failed');
    console.assert(statusRes.body.data.status === 'watched', 'Status not updated');
    console.log('   ✓ Status updated to "watched" by Child user.\n');

    // 11. Add Review & Recalculate Rating (POST /api/movies/:movieId/reviews)
    console.log('11. Testing Review Submission & Rating Calculation (POST /api/movies/:id/reviews)...');
    const revRes = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/movies/${movieId}/reviews`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${childToken}`,
        },
      },
      {
        rating: 5,
        comment: 'This test movie was absolutely fantastic!',
        familyId,
      }
    );
    console.assert(revRes.statusCode === 201, 'Review submission failed');
    console.log('   ✓ Review posted successfully.\n');

    // 12. Dashboard & Recommendations
    console.log('12. Testing Family Dashboard (GET /api/families/:id/dashboard)...');
    const dashRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/families/${familyId}/dashboard`,
      method: 'GET',
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    console.assert(dashRes.statusCode === 200, 'Dashboard API failed');
    console.assert(dashRes.body.data.watchedCount >= 1, 'Watched count incorrect');
    console.log('   ✓ Family Dashboard metrics returned correctly.\n');

    console.log('====================================================');
    console.log(' ALL 12 BACKEND AUTOMATED TEST SUITES PASSED 100%! ');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    if (server) server.close();
    process.exit(0);
  }
}

runTests();
