import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { Express } from 'express';

let app: Express;

beforeAll(async () => {
  app = await createApp();
});

describe('Family Movie Watchlist REST API Test Suite', () => {
  // 0. AUTHENTICATION (POST signup & login)
  it('POST /api/v1/auth/signup should register a new user account', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Dilip Sori',
        email: 'dilip@example.com',
        password: 'securePassword123'
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('dilip@example.com');
  });

  it('POST /api/v1/auth/login should authenticate user and return token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'dilip@example.com',
        password: 'securePassword123'
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe('Dilip Sori');
  });

  // 1. FAMILY & MEMBERS
  it('GET /api/v1/family/1 should return family details and seeded members', async () => {
    const res = await request(app).get('/api/v1/family/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('The Miller Family');
    expect(Array.isArray(res.body.members)).toBe(true);
    expect(res.body.members.length).toBeGreaterThanOrEqual(4);
  });

  it('POST /api/v1/members should add a new family member', async () => {
    const res = await request(app)
      .post('/api/v1/members')
      .send({
        family_id: 1,
        name: 'Uncle Dave',
        role: 'Other',
        age: 35,
        max_rating: 'PG-13',
        avatar_emoji: '🎩'
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Uncle Dave');
    expect(res.body.max_rating).toBe('PG-13');
  });

  // 2. MOVIES CATALOG
  it('GET /api/v1/movies should list movies and support filtering by genre', async () => {
    const res = await request(app).get('/api/v1/movies?genre=Animation');
    expect(res.status).toBe(200);
    expect(res.body.movies).toBeDefined();
    expect(res.body.movies.length).toBeGreaterThan(0);
    expect(res.body.movies[0].genres).toContain('Animation');
  });

  it('POST /api/v1/movies should create a new movie entry', async () => {
    const res = await request(app)
      .post('/api/v1/movies')
      .send({
        title: 'Despicable Me 4',
        release_year: 2024,
        genres: 'Animation, Comedy, Family',
        content_rating: 'PG',
        duration_minutes: 94,
        synopsis: 'Gru and his family face a new nemesis in Maxime Le Mal.',
        director: 'Chris Renaud',
        streaming_services: 'Peacock',
        imdb_rating: 6.2
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Despicable Me 4');
    expect(res.body.content_rating).toBe('PG');
  });

  // 3. WATCHLIST
  it('GET /api/v1/watchlist should return watchlist items with movie details', async () => {
    const res = await request(app).get('/api/v1/watchlist?family_id=1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('PATCH /api/v1/watchlist/:id should update watch status', async () => {
    const listRes = await request(app).get('/api/v1/watchlist?family_id=1');
    const firstItem = listRes.body.items[0];

    const patchRes = await request(app)
      .patch(`/api/v1/watchlist/${firstItem.watchlist_id}`)
      .send({ status: 'watched' });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe('watched');
  });

  // 4. RATINGS & REVIEWS
  it('POST /api/v1/ratings should record or update member rating', async () => {
    const res = await request(app)
      .post('/api/v1/ratings')
      .send({
        movie_id: 1,
        member_id: 1,
        rating: 5,
        review_text: 'Awesome movie!'
      });

    expect(res.status).toBe(200);
    expect(res.body.movie_id).toBe(1);
    expect(res.body.total_ratings).toBeGreaterThan(0);
  });

  // 5. RECOMMENDATION ENGINE (CONTENT RATING SAFETY FILTER)
  it('POST /api/v1/recommend should restrict max rating to PG when 8yo kid Leo is attending', async () => {
    const res = await request(app)
      .post('/api/v1/recommend')
      .send({
        family_id: 1,
        attending_member_ids: [1, 2, 4], // Dan (R), Sarah (R), Leo (8yo, PG)
        only_unwatched: false
      });

    expect(res.status).toBe(200);
    expect(res.body.max_allowed_rating).toBe('PG');
    expect(res.body.restriction_reason).toContain('Leo');

    // Ensure all recommendations are G or PG only!
    res.body.recommendations.forEach((rec: any) => {
      expect(['G', 'PG']).toContain(rec.content_rating);
    });
  });

  // 6. STATS
  it('GET /api/v1/stats should return family watchlist statistics', async () => {
    const res = await request(app).get('/api/v1/stats?family_id=1');
    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.total_watched_movies).toBeGreaterThanOrEqual(0);
  });
});
