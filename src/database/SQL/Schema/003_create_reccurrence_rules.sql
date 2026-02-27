CREATE TABLE IF NOT EXISTS recurrence_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  frequency TEXT NOT NULL, -- weekly, monthly
  interval INTEGER DEFAULT 1,
  FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
);