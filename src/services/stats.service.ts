import { db } from '../db';

export class StatsService {
  static getFamilyStats(family_id: number = 1) {
    // 1. Watchlist counts by status
    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM watchlist
      WHERE family_id = ?
      GROUP BY status
    `).all(family_id) as any[];

    const statusMap: Record<string, number> = {
      want_to_watch: 0,
      watching: 0,
      watched: 0
    };

    statusCounts.forEach(row => {
      statusMap[row.status] = row.count;
    });

    // 2. Total time watched (minutes)
    const timeRow = db.prepare(`
      SELECT SUM(m.duration_minutes) as total_minutes
      FROM watchlist w
      JOIN movies m ON w.movie_id = m.id
      WHERE w.family_id = ? AND w.status = 'watched'
    `).get(family_id) as any;

    const totalMinutes = timeRow?.total_minutes || 0;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // 3. Top Genres from watched movies
    const watchedMovies = db.prepare(`
      SELECT m.genres
      FROM watchlist w
      JOIN movies m ON w.movie_id = m.id
      WHERE w.family_id = ? AND w.status = 'watched'
    `).all(family_id) as any[];

    const genreCounts: Record<string, number> = {};
    watchedMovies.forEach(mov => {
      const genresList = mov.genres.split(',').map((g: string) => g.trim());
      genresList.forEach((g: string) => {
        if (g) genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });

    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Kid vs Adult Average Ratings
    const kidAvgRow = db.prepare(`
      SELECT AVG(r.rating) as avg_rating, COUNT(*) as count
      FROM ratings r
      JOIN members m ON r.member_id = m.id
      WHERE m.family_id = ? AND m.role = 'Kid'
    `).get(family_id) as any;

    const adultAvgRow = db.prepare(`
      SELECT AVG(r.rating) as avg_rating, COUNT(*) as count
      FROM ratings r
      JOIN members m ON r.member_id = m.id
      WHERE m.family_id = ? AND m.role IN ('Parent', 'Teen')
    `).get(family_id) as any;

    // 5. Top rated family movies
    const topRatedMovies = db.prepare(`
      SELECT 
        m.id,
        m.title,
        m.poster_url,
        m.release_year,
        AVG(r.rating) as family_avg_rating,
        COUNT(r.id) as rating_count
      FROM ratings r
      JOIN movies m ON r.movie_id = m.id
      JOIN members mem ON r.member_id = mem.id
      WHERE mem.family_id = ?
      GROUP BY m.id
      ORDER BY family_avg_rating DESC, rating_count DESC
      LIMIT 5
    `).all(family_id) as any[];

    return {
      family_id,
      summary: {
        total_watched_movies: statusMap.watched,
        total_want_to_watch: statusMap.want_to_watch,
        total_watching: statusMap.watching,
        total_time_watched_minutes: totalMinutes,
        total_time_watched_formatted: `${hours}h ${minutes}m`
      },
      top_genres: topGenres,
      rating_comparison: {
        kids: {
          average_rating: kidAvgRow?.avg_rating ? parseFloat(kidAvgRow.avg_rating.toFixed(2)) : null,
          total_reviews: kidAvgRow?.count || 0
        },
        adults_and_teens: {
          average_rating: adultAvgRow?.avg_rating ? parseFloat(adultAvgRow.avg_rating.toFixed(2)) : null,
          total_reviews: adultAvgRow?.count || 0
        }
      },
      top_rated_movies: topRatedMovies.map(m => ({
        ...m,
        family_avg_rating: parseFloat(m.family_avg_rating.toFixed(1))
      }))
    };
  }
}
