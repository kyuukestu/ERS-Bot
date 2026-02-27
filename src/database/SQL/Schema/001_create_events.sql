CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL UNIQUE COLLATE NOCASE, 
  description TEXT NOT NULL,
  event_date TEXT,         -- ISO: 2026-03-04
  event_time TEXT,         -- HH:MM (fictional time allowed)
  thread_id TEXT,
  GM_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  cancelled INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0
);