import { db } from '../db';
import { AppError } from '../middleware/errorHandler';

export class RatingService {
  static getMovieRatings(movieId: number) {
    const movie = db.prepare('SELECT id, title FROM movies WHERE id = ?').get(movieId);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    const ratings = db.prepare(`
      SELECT 
        r.id,
        r.movie_id,
        r.member_id,
        r.rating,
        r.review_text,
        r.created_at,
        m.name as member_name,
        m.role as member_role,
        m.avatar_emoji
      FROM ratings r
      JOIN members m ON r.member_id = m.id
      WHERE r.movie_id = ?
      ORDER BY r.created_at DESC
    `).all(movieId);

    const stats = db.prepare(`
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_ratings
      FROM ratings
      WHERE movie_id = ?
    `).get(movieId) as any;

    return {
      movie_id: movieId,
      movie_title: (movie as any).title,
      average_rating: stats?.average_rating ? parseFloat(stats.average_rating.toFixed(1)) : null,
      total_ratings: stats?.total_ratings || 0,
      ratings
    };
  }

  static addOrUpdateRating(data: {
    movie_id: number;
    member_id: number;
    rating: number;
    review_text?: string;
  }) {
    // Validate movie and member exist
    const movie = db.prepare('SELECT id FROM movies WHERE id = ?').get(data.movie_id);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    const member = db.prepare('SELECT id FROM members WHERE id = ?').get(data.member_id);
    if (!member) {
      throw new AppError('Family member not found', 404);
    }

    db.prepare(`
      INSERT INTO ratings (movie_id, member_id, rating, review_text)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(movie_id, member_id) DO UPDATE SET
        rating = excluded.rating,
        review_text = excluded.review_text,
        created_at = CURRENT_TIMESTAMP
    `).run(data.movie_id, data.member_id, data.rating, data.review_text || null);

    return this.getMovieRatings(data.movie_id);
  }

  static deleteRating(movieId: number, memberId: number) {
    const existing = db.prepare('SELECT id FROM ratings WHERE movie_id = ? AND member_id = ?').get(movieId, memberId);
    if (!existing) {
      throw new AppError('Rating not found for this member and movie', 404);
    }

    db.prepare('DELETE FROM ratings WHERE movie_id = ? AND member_id = ?').run(movieId, memberId);
    return { success: true, message: 'Rating deleted successfully' };
  }
}
