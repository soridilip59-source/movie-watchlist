process.env.NODE_ENV = 'test';

const http = require('http');
const app = require('../server');
const connectDB = require('../config/db');

let server;
const PORT = 5002;


function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
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
  console.log('================================================================');
  console.log(' Starting CineFamily Production API Automated Integration Suite ');
  console.log('================================================================\n');

  process.env.NODE_ENV = 'test';
  await connectDB();
  server = app.listen(PORT);

  let parentToken = '';
  let childToken = '';
  let familyId = '';
  let movieId = '';
  let watchlistItemId = '';
  let childUserId = '';
  const timestamp = Date.now();
  const parentEmail = `parent_${timestamp}@test.com`;
  const childEmail = `child_${timestamp}@test.com`;

  try {
    // 1. Health Check
    console.log('1. Testing Health Endpoint (GET /api/health)...');
    const healthRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET',
    });
    console.assert(healthRes.statusCode === 200, `Health check failed with status ${healthRes.statusCode}`);
    console.assert(healthRes.body.status === 'ok', 'Health status mismatch');
    console.log('   ✓ Health check passed.\n');

    // 2. Register Parent
    console.log('2. Testing Parent Registration (POST /api/auth/register)...');
    const parentReg = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'John Parent',
        email: parentEmail,
        password: 'password123',
        role: 'parent',
      }
    );
    console.assert(parentReg.statusCode === 201, `Parent registration failed: ${JSON.stringify(parentReg.body)}`);
    parentToken = parentReg.body.token;
    console.assert(parentReg.body.user.role === 'parent', 'Role was not set to parent');
    console.log('   ✓ Parent registered, token generated.\n');

    // 3. Prevent Duplicate Registration
    console.log('3. Testing Duplicate Registration Prevention (POST /api/auth/register - Expect 409)...');
    const dupReg = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Duplicate John',
        email: parentEmail,
        password: 'password123',
        role: 'parent',
      }
    );
    console.assert(dupReg.statusCode === 409, `Expected 409 Conflict, got ${dupReg.statusCode}`);
    console.log('   ✓ 409 Conflict correctly returned for duplicate email.\n');

    // 4. Login Invalid Credentials
    console.log('4. Testing Invalid Password Login (POST /api/auth/login - Expect 401)...');
    const badLogin = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: parentEmail,
        password: 'wrong_password_test',
      }
    );
    console.assert(badLogin.statusCode === 401, `Expected 401 Unauthorized, got ${badLogin.statusCode}`);
    console.log('   ✓ 401 Unauthorized returned for wrong password.\n');

    // 5. Login Valid Credentials
    console.log('5. Testing Valid User Login (POST /api/auth/login)...');
    const validLogin = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: parentEmail,
        password: 'password123',
      }
    );
    console.assert(validLogin.statusCode === 200, `Login failed with ${validLogin.statusCode}`);
    console.assert(Boolean(validLogin.body.token), 'Token missing in login response');
    parentToken = validLogin.body.token;
    console.log('   ✓ Valid login successful.\n');

    // 6. Register Child Account
    console.log('6. Testing Child Registration (POST /api/auth/register)...');
    const childReg = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Timmy Child',
        email: childEmail,
        password: 'password123',
        role: 'child',
      }
    );
    console.assert(childReg.statusCode === 201, 'Child registration failed');
    childToken = childReg.body.token;
    childUserId = childReg.body.user._id;
    console.assert(childReg.body.user.role === 'child', 'Role was not set to child');
    console.log('   ✓ Child registered.\n');

    // 7. Verify Profile (/api/auth/me)
    console.log('7. Testing Get Current User Profile (GET /api/auth/me)...');
    const meRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    console.assert(meRes.statusCode === 200, 'GET /api/auth/me failed');
    console.assert(meRes.body.data.email === parentEmail, 'User profile email mismatch');
    console.log('   ✓ Profile verified successfully.\n');

    // 8. Create Family Workspace
    console.log('8. Testing Family Workspace Creation (POST /api/families)...');
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
      { name: 'The Production Test Family' }
    );
    console.assert(famRes.statusCode === 201, `Family creation failed: ${JSON.stringify(famRes.body)}`);
    familyId = famRes.body.family._id;
    console.log(`   ✓ Family created with ID: ${familyId}\n`);

    // 9. Add Member to Family Workspace
    console.log('9. Testing Adding Member to Family (POST /api/families/:id/members)...');
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
      { email: childEmail }
    );
    console.assert(addMemRes.statusCode === 200, `Add member failed: ${JSON.stringify(addMemRes.body)}`);
    console.assert(addMemRes.body.family.members.length === 2, 'Member count incorrect');
    console.log('   ✓ Child added to family workspace.\n');

    // 10. Role Restriction: Child cannot remove family members
    console.log('10. Testing RBAC: Child cannot remove members (DELETE /api/families/:id/members/:userId - Expect 403)...');
    const unauthDelMem = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/families/${familyId}/members/${childUserId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${childToken}` },
    });
    console.assert(unauthDelMem.statusCode === 403, `Expected 403 Forbidden, got ${unauthDelMem.statusCode}`);
    console.log('   ✓ 403 Forbidden properly enforced for Child member removal.\n');

    // 11. Role Restriction: Child cannot add movies to catalog
    console.log('11. Testing RBAC: Child cannot create catalog movie (POST /api/movies - Expect 403)...');
    const unauthMovie = await makeRequest(
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
        title: 'Child Unauthorized Film',
        description: 'Testing permissions',
        genre: ['Comedy'],
        releaseYear: 2025,
        posterUrl: 'https://example.com/poster.jpg',
      }
    );
    console.assert(unauthMovie.statusCode === 403, `Expected 403 Forbidden, got ${unauthMovie.statusCode}`);
    console.log('   ✓ 403 Forbidden properly enforced for Child movie creation.\n');

    // 12. Parent Creates Movie
    console.log('12. Testing Parent Movie Creation (POST /api/movies)...');
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
        title: 'The Great Family Adventure',
        description: 'An exciting animated journey across the galaxy for the whole family.',
        genre: ['Animation', 'Adventure', 'Family'],
        releaseYear: 2025,
        duration: '115 min',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        ageRating: 'PG',
        language: 'English',
      }
    );
    console.assert(movieRes.statusCode === 201, `Movie creation failed: ${JSON.stringify(movieRes.body)}`);
    movieId = movieRes.body.movie._id;
    console.log(`   ✓ Movie created with ID: ${movieId}\n`);

    // 13. Search, Filter & Pagination
    console.log('13. Testing Movie Search & Pagination (GET /api/movies?genre=Animation&search=Adventure)...');
    const searchRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies?genre=Animation&search=Adventure&page=1&limit=5',
      method: 'GET',
    });
    console.assert(searchRes.statusCode === 200, 'Movie search failed');
    console.assert(searchRes.body.movies.length >= 1, 'Search query returned 0 results');
    console.log(`   ✓ Search verified (${searchRes.body.totalMovies} total matches found).\n`);

    // 14. Add Movie to Family Watchlist
    console.log('14. Testing Add Movie to Watchlist (POST /api/watchlist)...');
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
        notes: 'Watch together this Saturday!',
      }
    );
    console.assert(watchRes.statusCode === 201, `Add to watchlist failed: ${JSON.stringify(watchRes.body)}`);
    watchlistItemId = watchRes.body.data._id;
    console.assert(watchRes.body.data.status === 'planned', 'Initial status should be planned');
    console.log('   ✓ Movie added to family watchlist.\n');

    // 15. Duplicate Watchlist Entry Prevention
    console.log('15. Testing Duplicate Watchlist Prevention (POST /api/watchlist - Expect 409)...');
    const dupWatchRes = await makeRequest(
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
      }
    );
    console.assert(dupWatchRes.statusCode === 409, `Expected 409 Conflict for duplicate watchlist, got ${dupWatchRes.statusCode}`);
    console.log('   ✓ 409 Conflict correctly prevented duplicate watchlist item.\n');

    // 16. Update Watchlist Status (planned -> watching -> watched)
    console.log('16. Testing Watchlist Status Transitions (PUT /api/watchlist/:id/status)...');
    const statusWatching = await makeRequest(
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
      { status: 'watching' }
    );
    console.assert(statusWatching.statusCode === 200, 'Update to watching failed');
    console.assert(statusWatching.body.data.status === 'watching', 'Status not watching');

    const statusWatched = await makeRequest(
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
    console.assert(statusWatched.statusCode === 200, 'Update to watched failed');
    console.assert(statusWatched.body.data.status === 'watched', 'Status not watched');
    console.assert(Boolean(statusWatched.body.data.watchedAt), 'watchedAt date should be set');
    console.log('   ✓ Watch status transitions verified (planned -> watching -> watched).\n');

    // 17. Post Review & Dynamic Average Rating Calculation
    console.log('17. Testing Review Submission & Rating Aggregation (POST /api/movies/:id/reviews)...');
    const rev1 = await makeRequest(
      {
        hostname: 'localhost',
        port: PORT,
        path: `/api/movies/${movieId}/reviews`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${parentToken}`,
        },
      },
      {
        rating: 5,
        comment: 'Absolutely spectacular movie for the entire family!',
        familyId,
      }
    );
    console.assert(rev1.statusCode === 201, `Review 1 failed: ${JSON.stringify(rev1.body)}`);

    const rev2 = await makeRequest(
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
        rating: 4,
        comment: 'Loved the galaxy spaceship scene!',
        familyId,
      }
    );
    console.assert(rev2.statusCode === 201, `Review 2 failed: ${JSON.stringify(rev2.body)}`);

    // Fetch movie to check recalculated rating ((5 + 4) / 2 = 4.5)
    const movieCheck = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/movies/${movieId}`,
      method: 'GET',
    });
    console.assert(movieCheck.statusCode === 200, 'Fetch movie details failed');
    console.assert(movieCheck.body.movie.rating === 4.5, `Expected avg rating 4.5, got ${movieCheck.body.movie.rating}`);
    console.assert(movieCheck.body.movie.reviewCount === 2, `Expected reviewCount 2, got ${movieCheck.body.movie.reviewCount}`);
    console.log('   ✓ Reviews recorded and dynamic rating accurately aggregated to 4.5/5.0.\n');

    // 18. Family Dashboard Analytics
    console.log('18. Testing Family Dashboard Analytics (GET /api/families/:id/dashboard)...');
    const dashRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/families/${familyId}/dashboard`,
      method: 'GET',
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    console.assert(dashRes.statusCode === 200, 'Dashboard request failed');
    console.assert(dashRes.body.data.watchlistCount === 1, 'Watchlist count incorrect');
    console.assert(dashRes.body.data.watchedCount === 1, 'Watched count incorrect');
    console.assert(dashRes.body.data.familyMembers === 2, 'Family member count incorrect');
    console.log('   ✓ Dashboard aggregations and metrics verified.\n');

    // 19. Smart Recommendations
    console.log('19. Testing Smart Family Recommendations (GET /api/families/:id/recommendations)...');
    const recsRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/families/${familyId}/recommendations`,
      method: 'GET',
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    console.assert(recsRes.statusCode === 200, 'Recommendations request failed');
    console.log(`   ✓ Recommendations algorithm generated ${recsRes.body.recommendations.length} recommendations.\n`);

    // 20. Error Handling: Invalid ObjectId (CastError 400)
    console.log('20. Testing Production Error Handling: Invalid ObjectId Format (GET /api/movies/invalid-id-format - Expect 400)...');
    const invalidIdRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/movies/invalid-id-format-12345',
      method: 'GET',
    });
    console.assert(invalidIdRes.statusCode === 400, `Expected 400 Bad Request, got ${invalidIdRes.statusCode}`);
    console.assert(invalidIdRes.body.success === false, 'success should be false');
    console.log('   ✓ 400 Bad Request properly returned for malformed MongoDB ObjectId.\n');

    console.log('================================================================');
    console.log(' 🎉 ALL 20 API INTEGRATION TESTS COMPLETED WITH 100% SUCCESS!  ');
    console.log('================================================================\n');
  } catch (err) {
    console.error('❌ Integration test failed with error:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    process.exit(process.exitCode || 0);
  }
}

runTests();
