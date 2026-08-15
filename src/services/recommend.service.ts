import { db } from '../db';
import { AppError } from '../middleware/errorHandler';

const RATING_HIERARCHY: Record<string, number> = {
  'G': 1,
  'PG': 2,
  'PG-13': 3,
  'R': 4,
  'NC-17': 5
};

export class RecommendService {
  static getRecommendations(params: {
    family_id?: number;
    attending_member_ids: number[];
    genre?: string;
    max_duration?: number;
    streaming_service?: string;
    only_unwatched?: boolean;
  }) {
    const family_id = params.family_id || 1;

    if (!params.attending_member_ids || params.attending_member_ids.length === 0) {
      throw new AppError('At least one attending member must be specified', 400);
    }

    // 1. Fetch attending members details
    const placeholders = params.attending_member_ids.map(() => '?').join(',');
    const members = db.prepare(`
      SELECT id, name, role, age, max_rating, avatar_emoji
      FROM members
      WHERE id IN (${placeholders}) AND family_id = ?
    `).all(...params.attending_member_ids, family_id) as any[];

    if (members.length === 0) {
      throw new AppError('No valid attending family members found', 404);
    }

    // 2. Find lowest max_rating among attending members
    let lowestLevel = 5;
    let restrictingMember = members[0];

    for (const m of members) {
      const level = RATING_HIERARCHY[m.max_rating] || 5;
      if (level < lowestLevel) {
        lowestLevel = level;
        restrictingMember = m;
      }
    }

    const maxAllowedRatingStr = Object.keys(RATING_HIERARCHY).find(key => RATING_HIERARCHY[key] === lowestLevel) || 'PG';
    const allowedRatingLevels = Object.keys(RATING_HIERARCHY).filter(r => RATING_HIERARCHY[r] <= lowestLevel);

    // 3. Build SQL query for matching movies
    let query = `
      SELECT 
        m.id as movie_id,
        m.title,
        m.release_year,
        m.genres,
        m.content_rating,
        m.duration_minutes,
        m.synopsis,
        m.director,
        m.poster_url,
        m.streaming_services,
        m.imdb_rating,
        w.status as watchlist_status,
        w.priority as watchlist_priority
      FROM movies m
      LEFT JOIN watchlist w ON m.id = w.movie_id AND w.family_id = ?
      WHERE 1=1
    `;

    const values: any[] = [family_id];

    // Restrict content rating
    const ratingPlaceholders = allowedRatingLevels.map(() => '?').join(',');
    query += ` AND m.content_rating IN (${ratingPlaceholders})`;
    values.push(...allowedRatingLevels);

    if (params.only_unwatched !== false) {
      query += ` AND (w.status IS NULL OR w.status != 'watched')`;
    }

    if (params.genre) {
      query += ` AND m.genres LIKE ?`;
      values.push(`%${params.genre}%`);
    }

    if (params.max_duration) {
      query += ` AND m.duration_minutes <= ?`;
      values.push(params.max_duration);
    }

    if (params.streaming_service) {
      query += ` AND m.streaming_services LIKE ?`;
      values.push(`%${params.streaming_service}%`);
    }

    const candidateMovies = db.prepare(query).all(...values) as any[];

    // 4. Calculate Family Compatibility Score for each candidate
    const scoredRecommendations = candidateMovies.map(movie => {
      // Base IMDb score component (up to 40 pts)
      let score = (movie.imdb_rating / 10) * 40;

      // Watchlist priority boost (up to 30 pts)
      if (movie.watchlist_priority === 'high') score += 30;
      else if (movie.watchlist_priority === 'medium') score += 20;
      else if (movie.watchlist_priority === 'low') score += 10;
      else score += 15; // in catalog, not in watchlist

      // Family rating boost (up to 30 pts)
      const familyRatingRow = db.prepare('SELECT AVG(rating) as avg_rating FROM ratings WHERE movie_id = ?').get(movie.movie_id) as any;
      if (familyRatingRow?.avg_rating) {
        score += (familyRatingRow.avg_rating / 5) * 30;
      } else {
        score += 20; // Default rating score
      }

      // Clamp score to 100 max
      const finalScore = Math.min(100, Math.round(score));

      return {
        ...movie,
        family_compatibility_score: finalScore,
        family_average_rating: familyRatingRow?.avg_rating ? parseFloat(familyRatingRow.avg_rating.toFixed(1)) : null
      };
    });

    // Sort by compatibility score descending
    scoredRecommendations.sort((a, b) => b.family_compatibility_score - a.family_compatibility_score);

    // 5. Select random winner from top candidates (if any available)
    let winner = null;
    if (scoredRecommendations.length > 0) {
      // Pick randomly from top 3 for fun variety
      const topPool = scoredRecommendations.slice(0, Math.min(3, scoredRecommendations.length));
      winner = topPool[Math.floor(Math.random() * topPool.length)];
    }

    return {
      attending_members: members.map(m => ({
        id: m.id,
        name: m.name,
        role: m.role,
        max_rating: m.max_rating,
        avatar_emoji: m.avatar_emoji
      })),
      max_allowed_rating: maxAllowedRatingStr,
      restriction_reason: members.length > 1
        ? `Content rating restricted to maximum '${maxAllowedRatingStr}' due to ${restrictingMember.name} (${restrictingMember.age}yo)`
        : `Filtered for ${restrictingMember.name} (Max rating: ${maxAllowedRatingStr})`,
      total_candidates: scoredRecommendations.length,
      winner,
      recommendations: scoredRecommendations
    };
  }
}
