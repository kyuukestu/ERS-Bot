CREATE TABLE IF NOT EXISTS rss_feed_seal (
  threadID    TEXT PRIMARY KEY,
  title       TEXT,
  link        TEXT,
  pubDate     INTEGER,
  replyCount  INTEGER DEFAULT 0,
  tags TEXT
);

CREATE INDEX IF NOT EXISTS idx_rss_threadID ON rss_feed_seal(threadID);
CREATE INDEX IF NOT EXISTS idx_rss_pubDate ON rss_feed_seal(pubDate DESC);
