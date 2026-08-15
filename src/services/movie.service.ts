import { db } from '../db';
import { AppError } from '../middleware/errorHandler';

export class MovieService {
  static getMovies(params: {
    search?: string;
    genre?: string;
    content_rating?: string;
    streaming_service?: string;
    min_imdb?: number;
    limit?: number;
    offset?: number;
  }) {
    const { search, genre, content_rating, streaming_service, min_imdb, limit = 20, offset = 0 } = params;

    let query = 'SELECT * FROM movies WHERE 1=1';
    const values: any[] = [];

    if (search) {
      query += ' AND (title LIKE ? OR director LIKE ? OR synopsis LIKE ?)';
      const term = `%${search}%`;
      values.push(term, term, term);
    }

    if (genre) {
      query += ' AND genres LIKE ?';
      values.push(`%${genre}%`);
    }

    if (content_rating) {
      query += ' AND content_rating = ?';
      values.push(content_rating);
    }

    if (streaming_service) {
      query += ' AND streaming_services LIKE ?';
      values.push(`%${streaming_service}%`);
    }

    if (min_imdb !== undefined) {
      query += ' AND imdb_rating >= ?';
      values.push(min_imdb);
    }

    // Count total items
    const countSql = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const totalResult = db.prepare(countSql).get(...values) as { total: number };

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    values.push(limit, offset);

    const movies = db.prepare(query).all(...values);

    return {
      total: totalResult.total,
      limit,
      offset,
      movies
    };
  }

  static getMovieById(movieId: number) {
    const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(movieId) as any;
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    // Fetch ratings for this movie with member names
    const ratings = db.prepare(`
      SELECT r.id, r.rating, r.review_text, r.created_at, m.id as member_id, m.name as member_name, m.role as member_role, m.avatar_emoji
      FROM ratings r
      JOIN members m ON r.member_id = m.id
      WHERE r.movie_id = ?
      ORDER BY r.created_at DESC
    `).all(movieId);

    const avgRatingRow = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count FROM ratings WHERE movie_id = ?').get(movieId) as any;

    return {
      ...movie,
      family_average_rating: avgRatingRow?.avg_rating ? parseFloat(avgRatingRow.avg_rating.toFixed(1)) : null,
      family_rating_count: avgRatingRow?.rating_count || 0,
      ratings
    };
  }

  static createMovie(data: {
    title: string;
    release_year: number;
    genres: string;
    content_rating: string;
    duration_minutes: number;
    synopsis: string;
    director: string;
    poster_url?: string;
    streaming_services: string;
    imdb_rating?: number;
  }) {
    const result = db.prepare(`
      INSERT INTO movies (title, release_year, genres, content_rating, duration_minutes, synopsis, director, poster_url, streaming_services, imdb_rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.title,
      data.release_year,
      data.genres,
      data.content_rating,
      data.duration_minutes,
      data.synopsis,
      data.director,
      data.poster_url || null,
      data.streaming_services,
      data.imdb_rating || 0.0
    );

    return this.getMovieById(result.lastInsertRowid as number);
  }

  static updateMovie(movieId: number, data: Partial<{
    title: string;
    release_year: number;
    genres: string;
    content_rating: string;
    duration_minutes: number;
    synopsis: string;
    director: string;
    poster_url: string;
    streaming_services: string;
    imdb_rating: number;
  }>) {
    const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(movieId);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return this.getMovieById(movieId);

    values.push(movieId);
    db.prepare(`UPDATE movies SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getMovieById(movieId);
  }

  static deleteMovie(movieId: number) {
    const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(movieId);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }
    db.prepare('DELETE FROM movies WHERE id = ?').run(movieId);
    return { success: true, message: 'Movie deleted successfully' };
  }
}
