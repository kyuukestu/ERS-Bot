DROP TABLE IF EXISTS rss_feed;

CREATE TABLE IF NOT EXISTS rss_feed (
  threadID    TEXT PRIMARY KEY,
  title       TEXT,
  link        TEXT,
  pubDate     INTEGER,
  replyCount  INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_rss_threadID ON rss_feed(threadID);
CREATE INDEX IF NOT EXISTS idx_rss_pubDate ON rss_feed(pubDate DESC);