-- Family Movie Watchlist Database Schema

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS families (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Parent', 'Teen', 'Kid', 'Other')),
  age INTEGER NOT NULL,
  max_rating TEXT NOT NULL CHECK (max_rating IN ('G', 'PG', 'PG-13', 'R', 'NC-17')),
  avatar_emoji TEXT DEFAULT '👤',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  release_year INTEGER NOT NULL,
  genres TEXT NOT NULL,
  content_rating TEXT NOT NULL CHECK (content_rating IN ('G', 'PG', 'PG-13', 'R', 'NC-17')),
  duration_minutes INTEGER NOT NULL,
  synopsis TEXT NOT NULL,
  director TEXT NOT NULL,
  poster_url TEXT,
  streaming_services TEXT NOT NULL,
  imdb_rating REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_id INTEGER NOT NULL,
  movie_id INTEGER NOT NULL,
  added_by_member_id INTEGER,
  status TEXT NOT NULL CHECK (status IN ('want_to_watch', 'watching', 'watched')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  watched_at DATETIME,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (added_by_member_id) REFERENCES members(id) ON DELETE SET NULL,
  UNIQUE(family_id, movie_id)
);

CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE(movie_id, member_id)
);
