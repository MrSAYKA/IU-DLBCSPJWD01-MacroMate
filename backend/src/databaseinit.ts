import db from './database'

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS food_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  food_name TEXT NOT NULL,
  calories REAL,
  protein REAL,
  carbs REAL,
  fat REAL,
  quantity REAL NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'serving',
  logged_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  calories REAL,
  protein REAL,
  carbs REAL,
  fat REAL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`)