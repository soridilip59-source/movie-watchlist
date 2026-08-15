import { db } from '../db';
import { AppError } from '../middleware/errorHandler';

export class WatchlistService {
  static getWatchlist(params: {
    family_id?: number;
    status?: string;
    priority?: string;
    member_id?: number;
    genre?: string;
  }) {
    const family_id = params.family_id || 1;
    let query = `
      SELECT 
        w.id as watchlist_id,
        w.family_id,
        w.status,
        w.priority,
        w.notes,
        w.created_at as added_at,
        w.watched_at,
        w.added_by_member_id,
        m.name as added_by_member_name,
        m.avatar_emoji as added_by_avatar,
        mov.id as movie_id,
        mov.title,
        mov.release_year,
        mov.genres,
        mov.content_rating,
        mov.duration_minutes,
        mov.synopsis,
        mov.director,
        mov.poster_url,
        mov.streaming_services,
        mov.imdb_rating
      FROM watchlist w
      JOIN movies mov ON w.movie_id = mov.id
      LEFT JOIN members m ON w.added_by_member_id = m.id
      WHERE w.family_id = ?
    `;

    const values: any[] = [family_id];

    if (params.status) {
      query += ' AND w.status = ?';
      values.push(params.status);
    }

    if (params.priority) {
      query += ' AND w.priority = ?';
      values.push(params.priority);
    }

    if (params.member_id) {
      query += ' AND w.added_by_member_id = ?';
      values.push(params.member_id);
    }

    if (params.genre) {
      query += ' AND mov.genres LIKE ?';
      values.push(`%${params.genre}%`);
    }

    query += ' ORDER BY CASE w.priority WHEN "high" THEN 1 WHEN "medium" THEN 2 WHEN "low" THEN 3 END, w.created_at DESC';

    const items = db.prepare(query).all(...values) as any[];

    // Fetch average family rating for each watchlist movie
    return items.map(item => {
      const avg = db.prepare('SELECT AVG(rating) as avg_rating FROM ratings WHERE movie_id = ?').get(item.movie_id) as any;
      return {
        ...item,
        family_rating: avg?.avg_rating ? parseFloat(avg.avg_rating.toFixed(1)) : null
      };
    });
  }

  static addToWatchlist(data: {
    family_id: number;
    movie_id: number;
    added_by_member_id?: number;
    status?: 'want_to_watch' | 'watching' | 'watched';
    priority?: 'high' | 'medium' | 'low';
    notes?: string;
  }) {
    // Check if movie exists
    const movie = db.prepare('SELECT id FROM movies WHERE id = ?').get(data.movie_id);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    // Check if already in watchlist
    const existing = db.prepare('SELECT id FROM watchlist WHERE family_id = ? AND movie_id = ?').get(data.family_id, data.movie_id);
    if (existing) {
      throw new AppError('Movie is already in family watchlist', 400);
    }

    const watched_at = data.status === 'watched' ? new Date().toISOString() : null;

    const result = db.prepare(`
      INSERT INTO watchlist (family_id, movie_id, added_by_member_id, status, priority, notes, watched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.family_id,
      data.movie_id,
      data.added_by_member_id || null,
      data.status || 'want_to_watch',
      data.priority || 'medium',
      data.notes || null,
      watched_at
    );

    return this.getWatchlist({ family_id: data.family_id }).find(w => w.watchlist_id === result.lastInsertRowid);
  }

  static updateWatchlistItem(id: number, data: {
    status?: 'want_to_watch' | 'watching' | 'watched';
    priority?: 'high' | 'medium' | 'low';
    notes?: string;
  }) {
    const item = db.prepare('SELECT * FROM watchlist WHERE id = ?').get(id) as any;
    if (!item) {
      throw new AppError('Watchlist item not found', 404);
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
      if (data.status === 'watched' && item.status !== 'watched') {
        fields.push('watched_at = CURRENT_TIMESTAMP');
      } else if (data.status !== 'watched') {
        fields.push('watched_at = NULL');
      }
    }

    if (data.priority !== undefined) {
      fields.push('priority = ?');
      values.push(data.priority);
    }

    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }

    if (fields.length > 0) {
      values.push(id);
      db.prepare(`UPDATE watchlist SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM watchlist WHERE id = ?').get(id) as any;
    return this.getWatchlist({ family_id: updated.family_id }).find(w => w.watchlist_id === id);
  }

  static removeFromWatchlist(id: number) {
    const item = db.prepare('SELECT * FROM watchlist WHERE id = ?').get(id);
    if (!item) {
      throw new AppError('Watchlist item not found', 404);
    }
    db.prepare('DELETE FROM watchlist WHERE id = ?').run(id);
    return { success: true, message: 'Movie removed from watchlist' };
  }
}
