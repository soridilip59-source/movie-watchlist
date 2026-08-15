const API_BASE = '/api/v1';

let currentFamily = null;
let currentMembers = [];
let selectedAttendeeIds = [];

// DOM Loaded Initialization
document.addEventListener('DOMContentLoaded', async () => {
  setupTabNavigation();
  await loadFamilyData();
  await loadWatchlist();
  await loadCatalog();
  await loadStats();
});

// Helper: Debounce input
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Navigation Tabs
function setupTabNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn[data-tab]');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-page').forEach(page => page.classList.remove('active'));
      const targetPage = document.getElementById(`tab-${tabId}`);
      if (targetPage) targetPage.classList.add('active');

      if (tabId === 'watchlist') loadWatchlist();
      if (tabId === 'catalog') loadCatalog();
      if (tabId === 'picker') updateSafetyBanner();
      if (tabId === 'family') renderMembersPage();
      if (tabId === 'stats') loadStats();
    });
  });
}

// 1. FAMILY & MEMBERS DATA
async function loadFamilyData() {
  try {
    const res = await fetch(`${API_BASE}/family/1`);
    if (!res.ok) return;
    const data = await res.json();
    currentFamily = data;
    currentMembers = data.members || [];

    document.getElementById('family-title').textContent = data.name;

    // Render Avatar Chips
    const avatarsContainer = document.getElementById('family-avatars-list');
    avatarsContainer.innerHTML = currentMembers.map(m => `
      <div class="member-chip" title="${m.name} (${m.role}, Age ${m.age}, Max: ${m.max_rating})">
        <span>${m.avatar_emoji}</span>
        <span>${m.name.split(' ')[0]}</span>
        <span class="role-tag">(${m.max_rating})</span>
      </div>
    `).join('');

    // Populate Member dropdowns in filters
    const filterMemberSelect = document.getElementById('filter-member');
    filterMemberSelect.innerHTML = '<option value="">Everyone</option>' + 
      currentMembers.map(m => `<option value="${m.id}">${m.avatar_emoji} ${m.name}</option>`).join('');

    // Populate Attendee Checklist for Movie Night Picker
    selectedAttendeeIds = currentMembers.map(m => m.id); // Default select all
    renderAttendeeChecklist();
    updateSafetyBanner();
  } catch (err) {
    console.error('Failed to load family data:', err);
  }
}

// Render Attendee Checklist
function renderAttendeeChecklist() {
  const container = document.getElementById('attending-members-list');
  container.innerHTML = currentMembers.map(m => `
    <div class="attendee-item">
      <label>
        <input type="checkbox" value="${m.id}" ${selectedAttendeeIds.includes(m.id) ? 'checked' : ''} onchange="toggleAttendee(${m.id})">
        <span>${m.avatar_emoji} ${m.name}</span>
      </label>
      <span class="badge-rating ${m.max_rating}">${m.max_rating}</span>
    </div>
  `).join('');
}

function toggleAttendee(memberId) {
  if (selectedAttendeeIds.includes(memberId)) {
    if (selectedAttendeeIds.length === 1) {
      alert('At least one family member must attend movie night!');
      renderAttendeeChecklist();
      return;
    }
    selectedAttendeeIds = selectedAttendeeIds.filter(id => id !== memberId);
  } else {
    selectedAttendeeIds.push(memberId);
  }
  updateSafetyBanner();
}

function updateSafetyBanner() {
  const banner = document.getElementById('safety-banner');
  const title = document.getElementById('safety-title');
  const desc = document.getElementById('safety-desc');

  const attendingMembers = currentMembers.filter(m => selectedAttendeeIds.includes(m.id));
  if (attendingMembers.length === 0) return;

  const RATING_LEVELS = { 'G': 1, 'PG': 2, 'PG-13': 3, 'R': 4, 'NC-17': 5 };
  let lowestLevel = 5;
  let restrictingMember = attendingMembers[0];

  attendingMembers.forEach(m => {
    const lvl = RATING_LEVELS[m.max_rating] || 5;
    if (lvl < lowestLevel) {
      lowestLevel = lvl;
      restrictingMember = m;
    }
  });

  const maxAllowed = Object.keys(RATING_LEVELS).find(k => RATING_LEVELS[k] === lowestLevel) || 'PG';

  title.textContent = `Safe Guard Active: Max ${maxAllowed} Rating`;
  desc.textContent = attendingMembers.length > 1
    ? `Content auto-restricted to ${maxAllowed} because ${restrictingMember.name} (${restrictingMember.age}yo) is attending.`
    : `Filtered specifically for ${restrictingMember.name} (Max: ${maxAllowed}).`;

  if (maxAllowed === 'G' || maxAllowed === 'PG') {
    banner.className = 'safety-banner';
  } else {
    banner.className = 'safety-banner warning';
  }
}

// 2. WATCHLIST TAB
async function loadWatchlist() {
  const status = document.getElementById('filter-status').value;
  const priority = document.getElementById('filter-priority').value;
  const member_id = document.getElementById('filter-member').value;

  const params = new URLSearchParams({ family_id: 1 });
  if (status) params.append('status', status);
  if (priority) params.append('priority', priority);
  if (member_id) params.append('member_id', member_id);

  try {
    const res = await fetch(`${API_BASE}/watchlist?${params}`);
    const data = await res.json();
    renderWatchlist(data.items || []);
  } catch (err) {
    console.error('Error loading watchlist:', err);
  }
}

function renderWatchlist(items) {
  const container = document.getElementById('watchlist-container');
  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-picker-placeholder" style="grid-column: 1/-1;">
        <div class="placeholder-icon">🎬</div>
        <h3>No Movies in Watchlist</h3>
        <p>Add movies from the catalog to build your family watchlist!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="movie-card">
      <div class="movie-poster-wrap">
        ${item.poster_url ? `<img src="${item.poster_url}" class="movie-poster" alt="${item.title}">` : `<div class="movie-poster-placeholder">🍿</div>`}
        <span class="badge-rating ${item.content_rating}">${item.content_rating}</span>
        <span class="badge-status ${item.status}">${formatStatus(item.status)}</span>
      </div>
      <div class="movie-card-body">
        <h3 class="movie-title">${item.title} (${item.release_year})</h3>
        <div class="movie-meta-row">
          <span>⏱️ ${item.duration_minutes}m</span>
          <span>⭐ ${item.imdb_rating} IMDb</span>
          ${item.family_rating ? `<span style="color:#f59e0b; font-weight:700;">❤️ ${item.family_rating}/5 Family</span>` : ''}
        </div>
        <div class="genres-pills">
          ${item.genres.split(',').map(g => `<span class="genre-pill">${g.trim()}</span>`).join('')}
        </div>
        <p class="movie-synopsis">${item.synopsis}</p>
        ${item.notes ? `<div style="font-size:0.8rem; color:#60a5fa;">💬 "${item.notes}"</div>` : ''}
      </div>
      <div class="movie-card-footer">
        <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="viewMovieDetails(${item.movie_id})">Details & Reviews</button>
        <select onchange="updateWatchlistStatus(${item.watchlist_id}, this.value)" style="width: auto; padding: 4px 8px; font-size: 0.8rem;">
          <option value="want_to_watch" ${item.status === 'want_to_watch' ? 'selected' : ''}>Want to Watch</option>
          <option value="watching" ${item.status === 'watching' ? 'selected' : ''}>Watching</option>
          <option value="watched" ${item.status === 'watched' ? 'selected' : ''}>Watched ✔️</option>
        </select>
      </div>
    </div>
  `).join('');
}

function formatStatus(status) {
  if (status === 'want_to_watch') return 'Want To Watch';
  if (status === 'watching') return 'Watching';
  if (status === 'watched') return 'Watched';
  return status;
}

async function updateWatchlistStatus(watchlistId, newStatus) {
  try {
    await fetch(`${API_BASE}/watchlist/${watchlistId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    loadWatchlist();
  } catch (err) {
    console.error('Failed to update watchlist status:', err);
  }
}

// 3. MOVIE CATALOG TAB
async function loadCatalog() {
  const search = document.getElementById('catalog-search').value;
  const genre = document.getElementById('catalog-genre').value;
  const content_rating = document.getElementById('catalog-rating').value;

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (genre) params.append('genre', genre);
  if (content_rating) params.append('content_rating', content_rating);

  try {
    const res = await fetch(`${API_BASE}/movies?${params}`);
    const data = await res.json();
    renderCatalog(data.movies || []);
  } catch (err) {
    console.error('Error loading catalog:', err);
  }
}

function renderCatalog(movies) {
  const container = document.getElementById('catalog-container');
  if (movies.length === 0) {
    container.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-secondary);">No movies match search query.</p>`;
    return;
  }

  container.innerHTML = movies.map(mov => `
    <div class="movie-card">
      <div class="movie-poster-wrap">
        ${mov.poster_url ? `<img src="${mov.poster_url}" class="movie-poster" alt="${mov.title}">` : `<div class="movie-poster-placeholder">🎬</div>`}
        <span class="badge-rating ${mov.content_rating}">${mov.content_rating}</span>
      </div>
      <div class="movie-card-body">
        <h3 class="movie-title">${mov.title} (${mov.release_year})</h3>
        <div class="movie-meta-row">
          <span>⏱️ ${mov.duration_minutes}m</span>
          <span>⭐ ${mov.imdb_rating} IMDb</span>
        </div>
        <div class="genres-pills">
          ${mov.genres.split(',').map(g => `<span class="genre-pill">${g.trim()}</span>`).join('')}
        </div>
        <p class="movie-synopsis">${mov.synopsis}</p>
        <div style="font-size:0.78rem; color:var(--text-muted);">📺 Available on: <strong>${mov.streaming_services}</strong></div>
      </div>
      <div class="movie-card-footer">
        <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="viewMovieDetails(${mov.id})">Details & Rate</button>
        <button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="addMovieToWatchlistDirect(${mov.id})">+ Watchlist</button>
      </div>
    </div>
  `).join('');
}

async function addMovieToWatchlistDirect(movieId) {
  try {
    const res = await fetch(`${API_BASE}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        family_id: 1,
        movie_id: movieId,
        added_by_member_id: currentMembers[0]?.id || 1,
        status: 'want_to_watch',
        priority: 'high'
      })
    });
    const result = await res.json();
    if (res.ok) {
      alert('Movie added to family watchlist!');
    } else {
      alert(result.error || 'Movie is already in watchlist!');
    }
  } catch (err) {
    alert('Failed to add movie to watchlist.');
  }
}

// 4. MOVIE NIGHT GENERATOR
async function generateMovieNightRecommendation() {
  const genre = document.getElementById('picker-genre').value;
  const durationStr = document.getElementById('picker-duration').value;

  const payload = {
    family_id: 1,
    attending_member_ids: selectedAttendeeIds,
    only_unwatched: true
  };
  if (genre) payload.genre = genre;
  if (durationStr) payload.max_duration = parseInt(durationStr, 10);

  const resultsContainer = document.getElementById('picker-results');
  resultsContainer.innerHTML = `
    <div style="margin: auto; text-align: center;">
      <div class="placeholder-icon" style="animation: spin 1s infinite linear;">🎲</div>
      <h3>Spinning the Movie Wheel...</h3>
      <p style="color:var(--text-secondary);">Enforcing content ratings & calculating family compatibility scores...</p>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || !data.winner) {
      resultsContainer.innerHTML = `
        <div class="empty-picker-placeholder">
          <div class="placeholder-icon">🤔</div>
          <h3>No Eligible Movies Found</h3>
          <p>${data.restriction_reason || 'Try adjusting duration or genre filters!'}</p>
        </div>
      `;
      return;
    }

    renderRecommendationResult(data);
  } catch (err) {
    console.error('Failed to get recommendation:', err);
  }
}

function renderRecommendationResult(data) {
  const winner = data.winner;
  const container = document.getElementById('picker-results');

  container.innerHTML = `
    <div>
      <span class="winner-badge">🏆 Tonight's Movie Night Winner</span>
      <h2 style="font-family: var(--font-heading); font-size: 1.8rem; font-weight: 800;">${winner.title} (${winner.release_year})</h2>
      <p style="color: var(--accent-emerald); font-weight: 600; font-size: 0.9rem; margin-top: 4px;">
        🛡️ ${data.restriction_reason}
      </p>
    </div>

    <div class="winner-hero-card">
      ${winner.poster_url ? `<img src="${winner.poster_url}" class="winner-poster" alt="${winner.title}">` : `<div class="movie-poster-placeholder" style="height:280px;">🍿</div>`}
      <div style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
            <span class="badge-rating ${winner.content_rating}">${winner.content_rating}</span>
            <span style="color:var(--text-secondary); font-size:0.9rem;">⏱️ ${winner.duration_minutes} mins</span>
            <span style="color:var(--text-secondary); font-size:0.9rem;">⭐ ${winner.imdb_rating} IMDb</span>
          </div>

          <div class="genres-pills" style="margin-bottom: 12px;">
            ${winner.genres.split(',').map(g => `<span class="genre-pill">${g.trim()}</span>`).join('')}
          </div>

          <p style="font-size:0.92rem; color:var(--text-secondary); line-height:1.6;">${winner.synopsis}</p>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-top:10px;">🎬 Director: ${winner.director}</div>
          <div style="font-size:0.85rem; color:var(--text-muted);">📺 Stream on: <strong>${winner.streaming_services}</strong></div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:700; margin-bottom:4px;">
            <span>Family Match Compatibility</span>
            <span style="color:var(--accent-primary);">${winner.family_compatibility_score}%</span>
          </div>
          <div class="score-progress-bar">
            <div class="score-progress-fill" style="width: ${winner.family_compatibility_score}%;"></div>
          </div>

          <div style="display:flex; gap:12px; margin-top:16px;">
            <button class="btn btn-accent flex-2" onclick="addMovieToWatchlistDirect(${winner.movie_id})">➕ Add to Watchlist</button>
            <button class="btn btn-secondary" onclick="viewMovieDetails(${winner.movie_id})">Ratings & Reviews</button>
          </div>
        </div>
      </div>
    </div>

    <h3 style="margin-top: 28px; margin-bottom: 16px; font-family: var(--font-heading); font-size: 1.2rem;">Other Safe Candidates (${data.total_candidates} total)</h3>
    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px;">
      ${data.recommendations.filter(r => r.movie_id !== winner.movie_id).slice(0, 4).map(rec => `
        <div style="background:var(--bg-input); border:1px solid var(--border-color); padding:12px; border-radius:var(--radius-md);">
          <div style="font-weight:700; font-size:0.92rem;">${rec.title}</div>
          <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--text-secondary); margin-top:4px;">
            <span class="badge-rating ${rec.content_rating}">${rec.content_rating}</span>
            <span>⭐ ${rec.imdb_rating} IMDb</span>
            <span style="color:#60a5fa; font-weight:700;">${rec.family_compatibility_score}% Match</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// 5. VIEW MOVIE DETAILS & REVIEW MODAL
async function viewMovieDetails(movieId) {
  try {
    const res = await fetch(`${API_BASE}/movies/${movieId}`);
    const movie = await res.json();

    document.getElementById('detail-title').textContent = movie.title;

    const detailBody = document.getElementById('detail-body');
    detailBody.innerHTML = `
      <div style="display:grid; grid-template-columns: 180px 1fr; gap:20px;">
        ${movie.poster_url ? `<img src="${movie.poster_url}" style="width:100%; border-radius:var(--radius-md); object-fit:cover; height:240px;">` : `<div class="movie-poster-placeholder" style="height:240px;">🎬</div>`}
        <div>
          <div style="display:flex; gap:10px; align-items:center; margin-bottom:8px;">
            <span class="badge-rating ${movie.content_rating}">${movie.content_rating}</span>
            <span style="color:var(--text-secondary);">${movie.release_year}</span>
            <span style="color:var(--text-secondary);">⏱️ ${movie.duration_minutes}m</span>
            <span style="color:var(--text-secondary);">⭐ ${movie.imdb_rating} IMDb</span>
          </div>
          <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.5;">${movie.synopsis}</p>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-top:8px;">🎬 Director: ${movie.director}</div>
          <div style="font-size:0.85rem; color:var(--text-muted);">📺 Streaming: ${movie.streaming_services}</div>
          
          <div style="margin-top:12px; background:#0f172a; padding:10px 14px; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:flex; gap:20px; align-items:center;">
            <div>
              <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Family Score</div>
              <div style="font-size:1.4rem; font-weight:800; color:var(--accent-gold);">
                ${movie.family_average_rating ? `⭐ ${movie.family_average_rating} / 5` : 'No ratings yet'}
              </div>
            </div>
            <div style="font-size:0.82rem; color:var(--text-secondary);">${movie.family_rating_count} member review(s)</div>
          </div>
        </div>
      </div>

      <hr style="border:none; border-top:1px solid var(--border-color); margin: 20px 0;">

      <!-- Submit Review Section -->
      <h4 style="font-family:var(--font-heading); margin-bottom:12px;">Add Your Family Member Review</h4>
      <form onsubmit="submitReview(event, ${movie.id})" style="display:flex; gap:10px; flex-wrap:wrap; background:#0f172a; padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
        <select id="review-member-id" required style="flex:1; min-width:140px;">
          ${currentMembers.map(m => `<option value="${m.id}">${m.avatar_emoji} ${m.name}</option>`).join('')}
        </select>
        <select id="review-rating" required style="width:100px;">
          <option value="5">⭐⭐⭐⭐⭐ (5)</option>
          <option value="4">⭐⭐⭐⭐ (4)</option>
          <option value="3">⭐⭐⭐ (3)</option>
          <option value="2">⭐⭐ (2)</option>
          <option value="1">⭐ (1)</option>
        </select>
        <input type="text" id="review-text" placeholder="Write a short review..." style="flex:2; min-width:200px;">
        <button type="submit" class="btn btn-primary">Submit Rating</button>
      </form>

      <!-- Member Reviews List -->
      <h4 style="font-family:var(--font-heading); margin-top:20px; margin-bottom:12px;">Member Reviews</h4>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${movie.ratings.length === 0 ? `<p style="font-size:0.85rem; color:var(--text-muted);">No reviews written yet.</p>` : movie.ratings.map(r => `
          <div style="background:#0f172a; border:1px solid var(--border-color); padding:12px; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-weight:700; font-size:0.9rem;">${r.avatar_emoji} ${r.member_name} <span style="font-size:0.75rem; color:var(--text-muted);">(${r.member_role})</span></div>
              <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">"${r.review_text || 'No review text'}"</div>
            </div>
            <div style="color:var(--accent-gold); font-weight:700;">⭐ ${r.rating}/5</div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('movie-detail-modal').classList.add('active');
  } catch (err) {
    console.error('Failed to fetch movie details:', err);
  }
}

async function submitReview(event, movieId) {
  event.preventDefault();
  const member_id = parseInt(document.getElementById('review-member-id').value, 10);
  const rating = parseInt(document.getElementById('review-rating').value, 10);
  const review_text = document.getElementById('review-text').value;

  try {
    const res = await fetch(`${API_BASE}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movie_id: movieId, member_id, rating, review_text })
    });
    if (res.ok) {
      viewMovieDetails(movieId); // Refresh modal content
      loadWatchlist();
    }
  } catch (err) {
    console.error('Failed to submit review:', err);
  }
}

// 6. FAMILY PROFILES PAGE
function renderMembersPage() {
  const container = document.getElementById('members-container');
  container.innerHTML = currentMembers.map(m => `
    <div class="member-card">
      <div class="member-avatar">${m.avatar_emoji}</div>
      <div class="member-info">
        <h4>${m.name}</h4>
        <p>Role: <strong>${m.role}</strong> (${m.age} yo)</p>
        <p style="margin-top:4px;">Max Content Rating: <span class="badge-rating ${m.max_rating}">${m.max_rating}</span></p>
      </div>
    </div>
  `).join('');
}

// 7. STATS PAGE
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats?family_id=1`);
    const stats = await res.json();

    const container = document.getElementById('stats-container');
    container.innerHTML = `
      <div class="stat-box">
        <div class="stat-label">Total Movies Watched</div>
        <div class="stat-value">${stats.summary.total_watched_movies}</div>
        <div style="font-size:0.8rem; color:var(--text-muted);">${stats.summary.total_want_to_watch} movies in want-to-watch queue</div>
      </div>

      <div class="stat-box">
        <div class="stat-label">Total Time Screened</div>
        <div class="stat-value" style="color:var(--accent-gold);">${stats.summary.total_time_watched_formatted}</div>
        <div style="font-size:0.8rem; color:var(--text-muted);">${stats.summary.total_time_watched_minutes} total minutes</div>
      </div>

      <div class="stat-box">
        <div class="stat-label">Kids Avg Rating</div>
        <div class="stat-value" style="color:var(--accent-emerald);">
          ${stats.rating_comparison.kids.average_rating ? `⭐ ${stats.rating_comparison.kids.average_rating}` : 'N/A'}
        </div>
        <div style="font-size:0.8rem; color:var(--text-muted);">${stats.rating_comparison.kids.total_reviews} kid review(s)</div>
      </div>

      <div class="stat-box">
        <div class="stat-label">Adults & Teens Avg Rating</div>
        <div class="stat-value" style="color:#60a5fa;">
          ${stats.rating_comparison.adults_and_teens.average_rating ? `⭐ ${stats.rating_comparison.adults_and_teens.average_rating}` : 'N/A'}
        </div>
        <div style="font-size:0.8rem; color:var(--text-muted);">${stats.rating_comparison.adults_and_teens.total_reviews} adult review(s)</div>
      </div>

      <div class="stat-box" style="grid-column: 1 / -1;">
        <div class="stat-label" style="margin-bottom:12px;">Top Family Favorite Genres</div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${stats.top_genres.length === 0 ? `<p style="font-size:0.85rem; color:var(--text-muted);">Watch more movies to build genre analytics!</p>` : stats.top_genres.map(g => `
            <div>
              <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
                <span>${g.genre}</span>
                <span style="font-weight:700;">${g.count} movie(s)</span>
              </div>
              <div class="score-progress-bar">
                <div class="score-progress-fill" style="width: ${Math.min(100, g.count * 25)}%;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// MODAL HANDLERS
function openAddMovieModal() {
  document.getElementById('add-movie-modal').classList.add('active');
}

function openAddMemberModal() {
  document.getElementById('add-member-modal').classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

async function handleCreateMovie(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('m-title').value,
    release_year: parseInt(document.getElementById('m-year').value, 10),
    content_rating: document.getElementById('m-rating').value,
    duration_minutes: parseInt(document.getElementById('m-duration').value, 10),
    imdb_rating: parseFloat(document.getElementById('m-imdb').value),
    genres: document.getElementById('m-genres').value,
    director: document.getElementById('m-director').value,
    streaming_services: document.getElementById('m-streaming').value,
    synopsis: document.getElementById('m-synopsis').value
  };

  try {
    const res = await fetch(`${API_BASE}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal('add-movie-modal');
      loadCatalog();
      alert('New movie added to catalog!');
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to create movie.');
    }
  } catch (err) {
    alert('Failed to connect to server.');
  }
}

async function handleCreateMember(e) {
  e.preventDefault();
  const payload = {
    family_id: 1,
    name: document.getElementById('mem-name').value,
    role: document.getElementById('mem-role').value,
    age: parseInt(document.getElementById('mem-age').value, 10),
    max_rating: document.getElementById('mem-maxrating').value,
    avatar_emoji: document.getElementById('mem-avatar').value || '👤'
  };

  try {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeModal('add-member-modal');
      await loadFamilyData();
      renderMembersPage();
      alert('New family member profile created!');
    }
  } catch (err) {
    alert('Failed to add member.');
  }
}
