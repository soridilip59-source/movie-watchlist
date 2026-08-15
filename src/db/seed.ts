import { getDb, db, DBWrapper } from './index';
import fs from 'fs';
import path from 'path';

export async function seedDatabase() {
  const sqlInstance = await getDb();
  DBWrapper.setDb(sqlInstance);

  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schemaSql);
  }

  // Clear existing data in reverse order of foreign keys
  db.exec('DELETE FROM ratings;');
  db.exec('DELETE FROM watchlist;');
  db.exec('DELETE FROM movies;');
  db.exec('DELETE FROM members;');
  db.exec('DELETE FROM families;');

  // Reset autoincrement sequence if sqlite_sequence exists
  try {
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('families', 'members', 'movies', 'watchlist', 'ratings');");
  } catch (e) {}

  // Insert Family
  db.prepare('INSERT INTO families (id, name) VALUES (?, ?)').run(1, 'The Miller Family');

  // Insert Members
  const members = [
    [1, 'Dan (Dad)', 'Parent', 40, 'R', '👨‍👩‍👧‍👦'],
    [1, 'Sarah (Mom)', 'Parent', 38, 'R', '👩‍💻'],
    [1, 'Maya', 'Teen', 15, 'PG-13', '🎧'],
    [1, 'Leo', 'Kid', 8, 'PG', '🦸‍♂️']
  ];

  for (const m of members) {
    db.prepare(`
      INSERT INTO members (family_id, name, role, age, max_rating, avatar_emoji)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(...m);
  }

  // Insert Movies
  const movies = [
    [
      'Inside Out 2',
      2024,
      'Animation, Comedy, Family',
      'PG',
      96,
      'Teenager Riley experiences new emotions as Joy, Sadness, Anger, Fear, and Disgust make room for Anxiety, Envy, Ennui, and Embarrassment.',
      'Kelsey Mann',
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
      'Disney+',
      7.7
    ],
    [
      'Spider-Man: Across the Spider-Verse',
      2023,
      'Animation, Action, Sci-Fi',
      'PG-13',
      140,
      'Miles Morales catapults across the Multiverse, encountering a team of Spider-People charged with protecting its existence.',
      'Joaquim Dos Santos, Kemp Powers',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80',
      'Netflix',
      8.6
    ],
    [
      'Paddington 2',
      2017,
      'Adventure, Comedy, Family',
      'PG',
      103,
      'Paddington undertakes a number of odd jobs to buy the perfect present for his Aunt Lucy\'s 100th birthday, only for the gift to be stolen.',
      'Paul King',
      'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=500&auto=format&fit=crop&q=80',
      'Prime Video',
      7.8
    ],
    [
      'The Incredibles',
      2004,
      'Animation, Action, Adventure',
      'PG',
      115,
      'A family of undercover superheroes, while trying to live the quiet suburban life, are forced into action to save the world.',
      'Brad Bird',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
      'Disney+',
      8.0
    ],
    [
      'Spirited Away',
      2001,
      'Animation, Adventure, Family',
      'PG',
      125,
      'During her family\'s move to the suburbs, a 10-year-old girl wanders into a world ruled by gods, witches and spirits.',
      'Hayao Miyazaki',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
      'Max, Netflix',
      8.6
    ],
    [
      'The Princess Bride',
      1987,
      'Adventure, Comedy, Family',
      'PG',
      98,
      'A bedridden boy\'s grandfather reads him the story of a farmboy-turned-pirate who encounters numerous obstacles and enemies.',
      'Rob Reiner',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&auto=format&fit=crop&q=80',
      'Disney+, Hulu',
      8.0
    ],
    [
      'Interstellar',
      2014,
      'Adventure, Drama, Sci-Fi',
      'PG-13',
      169,
      'When Earth becomes uninhabitable, a farmer and ex-NASA pilot is asked to pilot a spacecraft to find a new planet.',
      'Christopher Nolan',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
      'Paramount+',
      8.7
    ],
    [
      'Finding Nemo',
      2003,
      'Animation, Adventure, Comedy',
      'G',
      100,
      'After his son is captured in the Great Barrier Reef, a timid clownfish sets out on a journey to bring him home.',
      'Andrew Stanton, Lee Unkrich',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80',
      'Disney+',
      8.2
    ],
    [
      'E.T. the Extra-Terrestrial',
      1982,
      'Adventure, Family, Sci-Fi',
      'PG',
      115,
      'A troubled child summons the courage to help a friendly alien escape Earth and return to his home planet.',
      'Steven Spielberg',
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&auto=format&fit=crop&q=80',
      'Peacock',
      7.9
    ],
    [
      'Coco',
      2017,
      'Animation, Adventure, Drama',
      'PG',
      105,
      'Aspiring musician Miguel enters the Land of the Dead to find his great-great-grandfather, a legendary singer.',
      'Lee Unkrich, Adrian Molina',
      'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=500&auto=format&fit=crop&q=80',
      'Disney+',
      8.4
    ],
    [
      'Kung Fu Panda 4',
      2024,
      'Animation, Action, Comedy',
      'PG',
      94,
      'Po must train a new warrior when he\'s chosen to become the Spiritual Leader of the Valley of Peace.',
      'Mike Mitchell',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
      'Peacock',
      6.7
    ],
    [
      'Guardians of the Galaxy',
      2014,
      'Action, Adventure, Comedy',
      'PG-13',
      121,
      'A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.',
      'James Gunn',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
      'Disney+',
      8.0
    ]
  ];

  for (const mov of movies) {
    db.prepare(`
      INSERT INTO movies (title, release_year, genres, content_rating, duration_minutes, synopsis, director, poster_url, streaming_services, imdb_rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...mov);
  }

  // Insert Watchlist Items
  const watchlistItems = [
    [1, 1, 1, 'want_to_watch', 'high', 'Everyone wants to see the new emotions!', null],
    [1, 2, 3, 'want_to_watch', 'high', 'Maya recommendation for movie night', null],
    [1, 3, 2, 'watched', 'medium', 'A wholesome Sunday afternoon movie', '2026-08-01 19:30:00'],
    [1, 4, 1, 'watched', 'high', 'Classics night! Kids loved Jack-Jack', '2026-07-20 20:00:00'],
    [1, 5, 2, 'want_to_watch', 'medium', 'Ghibli marathon suggestion', null],
    [1, 8, 4, 'watched', 'high', 'Leo\'s absolute favorite sea adventure', '2026-06-15 18:00:00'],
    [1, 10, 2, 'watched', 'high', 'Beautiful music and emotional story', '2026-05-10 19:00:00'],
    [1, 7, 1, 'want_to_watch', 'low', 'Parents date night or Maya (15) watching with parents', null]
  ];

  for (const w of watchlistItems) {
    db.prepare(`
      INSERT INTO watchlist (family_id, movie_id, added_by_member_id, status, priority, notes, watched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(...w);
  }

  // Insert Ratings & Reviews
  const ratings = [
    [3, 1, 5, 'Masterpiece of cozy cinema! Dan approved.'],
    [3, 4, 5, 'Paddington is so funny and marmalade is awesome!'],
    [4, 1, 5, 'Great superhero action for the family.'],
    [4, 3, 4, 'Loved Elastigirl and Syndrome.'],
    [4, 4, 5, 'Jack Jack powers were super funny!'],
    [8, 4, 5, 'Dory is so hilarious, I want to watch it 100 times!'],
    [8, 2, 4, 'Heartwarming story about parenting and letting go.'],
    [10, 2, 5, 'Tears were shed! Absolutely stunning visual art and music.'],
    [10, 3, 5, 'The Remember Me song is so good!']
  ];

  for (const r of ratings) {
    db.prepare(`
      INSERT INTO ratings (movie_id, member_id, rating, review_text)
      VALUES (?, ?, ?, ?)
    `).run(...r);
  }

  console.log('✅ Family Movie Watchlist Database seeded successfully!');
}

if (require.main === module) {
  seedDatabase().catch(console.error);
}
