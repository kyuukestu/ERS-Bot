import fs from 'fs';
import path from 'path';
import Database from 'bun:sqlite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLPath = path.join(process.cwd(), 'src', 'database', 'SQL');

const dataDir = path.join(SQLPath, 'data');
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'events.db');
export const db = new Database(dbPath);

//NOTE - Legacy from better-sqlite3; consider usage if Bun ABI ever matches back up
// db.pragma('journal_mode = WAL');
// db.pragma('foreign_keys = ON');

// Read the SQL file
const sqlDir = path.join(__dirname, 'Schema');
const files = fs.readdirSync(sqlDir).filter((f) => f.endsWith('.sql'));

export function initializeSQLDB() {
	for (const file of files) {
		const sql = fs.readFileSync(path.join(sqlDir, file), 'utf-8');
		db.run(sql);
	}
}
