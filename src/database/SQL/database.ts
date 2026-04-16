import fs from 'fs';
import path from 'path';
import Database from 'bun:sqlite';
import { fileURLToPath } from 'url';

// 1. Resolve paths first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SQLPath = path.join(process.cwd(), 'src', 'database', 'SQL');
const dataDir = path.join(SQLPath, 'data');

// 2. Ensure directory exists
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'events.db');
const rssDBPath = path.join(dataDir, 'rss_feed.db');

// 3. NOW initialize the databases
export const db = new Database(dbPath);
export const rssDB = new Database(rssDBPath);

// 4. Resolve schema directories
const sqlDir = path.join(__dirname, 'Event_Schema');
const rssDir = path.join(__dirname, 'RSS_Schema');

// 5. Read the files
const files = fs.readdirSync(sqlDir).filter((f) => f.endsWith('.sql'));
const rssFiles = fs.readdirSync(rssDir).filter((f) => f.endsWith('.sql'));

export function initializeSQLDB() {
	for (const file of files) {
		const sql = fs.readFileSync(path.join(sqlDir, file), 'utf-8');
		db.run(sql);
	}

	for (const file of rssFiles) {
		const sql = fs.readFileSync(path.join(rssDir, file), 'utf-8');
		rssDB.run(sql);
	}

	syncDatabaseWithConfig();
}

function syncDatabaseWithConfig() {
	// Check for 'tags' column here to ensure it exists before syncing
	const info = rssDB.prepare('PRAGMA table_info(rss_feed)').all() as {
		name: string;
	}[];
	if (!info.some((c) => c.name === 'tags')) {
		rssDB.run('ALTER TABLE rss_feed ADD COLUMN tags TEXT');
	}

	const insertStmt = rssDB.prepare(`
        INSERT OR IGNORE INTO rss_feed (threadID, title, replyCount) 
        VALUES (?, ?, 0)
    `);

	for (const [id, name] of THREAD_CONFIG.entries()) {
		insertStmt.run(id, name);
	}

	console.log('Database synced with Thread Config.');
}

export const THREAD_CONFIG = new Map<string, string>([
	// [ 'ID', 'Human Readable Name' ]
	['536653', 'Kanto IC'],
	['536282', 'Johto IC'],
	['536427', 'Hoenn IC'],
	['536347', 'Sinnoh IC'],
	['536371', 'Unova IC'],
	['536922', 'Kalos IC'],
	['536341', 'Alola IC'],
	['536350', 'Galar IC'],
	['536348', 'Paldea IC'],
	['536297', 'Orange Islands IC'],
	['551406', 'Oblivia IC'],
	['560446', 'Sanguine Swarms IC'],
	['565794', 'Lilycove WCS IC'],
	['555337', 'Medieval Festival IC'],
	['536418', 'Main OOC'],
	['560252', 'Sanguine Swarm OOC'],
	['566603', 'Chatter'],
	['536117', 'Main CS'],
	['570906', 'Elder Carp'],
	['570988', 'Elder Carp CS'],
	['571433', 'Lumiose Blues'],
	['560392', 'Road to Mahogaony Town'],
]);
