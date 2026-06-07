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

const rssDBPathSeal = path.join(dataDir, 'rss_feed_seal.db');

// 3. NOW initialize the databases
export const rssDBSeal = new Database(rssDBPathSeal);

// 4. Resolve schema directories
const rssDir = path.join(__dirname, 'RSS_Seal_Schema');

// 5. Read the files
const rssFiles = fs.readdirSync(rssDir).filter((f) => f.endsWith('.sql'));

export function initializeSQLDBSeal() {
	for (const file of rssFiles) {
		const sql = fs.readFileSync(path.join(rssDir, file), 'utf-8');
		rssDBSeal.run(sql);
	}

	syncDatabaseWithConfig();
}

function syncDatabaseWithConfig() {
	// Check for 'tags' column here to ensure it exists before syncing
	const info = rssDBSeal.prepare('PRAGMA table_info(rss_feed_seal)').all() as {
		name: string;
	}[];
	if (!info.some((c) => c.name === 'tags')) {
		rssDBSeal.run('ALTER TABLE rss_feed_seal ADD COLUMN tags TEXT');
	}

	const insertStmt = rssDBSeal.prepare(`
        INSERT OR IGNORE INTO rss_feed_seal (threadID, title, replyCount) 
        VALUES (?, ?, 0)
    `);

	for (const [id, name] of THREAD_CONFIG.entries()) {
		insertStmt.run(id, name);
	}

	console.log('Seal Database synced with Thread Config.');
}

export const THREAD_CONFIG = new Map<string, string>([
	// [ 'ID', 'Human Readable Name' ]
	['547855', 'Shadow of The Seal IC'],
	['548719', 'Shadow of The Seal RP'],
	['547883', 'Shadow of The Seal OOC'],
]);
