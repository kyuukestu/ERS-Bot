CREATE TABLE IF NOT EXISTS rss_seen (
  guid TEXT PRIMARY KEY,
  threadID  TEXT NOT NULL,
  title TEXT,
  link TEXT,
  pubDate INTEGER
);

CREATE INDEX IF NOT EXISTS idx_rss_pubDate ON rss_seen(pubDate DESC);
CREATE INDEX IF NOT EXISTS idx_rss_threadID ON rss_seen(threadID);