CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,         -- ISO: 2026-03-04
  event_time TEXT NOT NULL,         -- HH:MM (fictional time allowed)
  channel_id TEXT NOT NULL,
  thread_id TEXT,
  message_id TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  cancelled INTEGER DEFAULT 0
);