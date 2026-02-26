import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), 'data', 'events.db');

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Read the SQL file
const sqlDir = path.join(__dirname, 'Schema');
const files = fs.readdirSync(sqlDir).filter((f) => f.endsWith('.sql'));

for (const file of files) {
	const sql = fs.readFileSync(path.join(sqlDir, file), 'utf-8');
	db.exec(sql);
}
export function initializeSchema() {
	db.exec(`
        CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      event_time TEXT NOT NULL,
      channel_id TEXT NOT NULL,
      thread_id TEXT,
      message_id TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      cancelled INTEGER DEFAULT 0
    );
    `);
}
