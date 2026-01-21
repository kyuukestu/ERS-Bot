import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import Fuse from 'fuse.js';

interface Move {
	name: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(
	__dirname,
	'../../../public/json/moves-list.json',
);

if (!fs.existsSync(filePath)) {
	throw new Error(`Move list not found at ${filePath}`);
}

const moveList: Move[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const normalizeMoves = moveList.map((m) => ({
	...m,
	searchName: m.name.replace(/-/g, ' '),
}));

const fuse = new Fuse(normalizeMoves, {
	keys: ['searchName'],
	includeScore: true,
	threshold: 0.3,
});

export const matchMoveName = (
	userInput: string,
): {
	bestMatch: Move;
	otherMatches: Move[];
} => {
	const results = fuse.search(userInput);

	if (results.length === 0) {
		throw new Error('No moves matched your search.');
	}

	const [bestMatch, ...otherMatches] = results;

	return {
		bestMatch: bestMatch.item,
		otherMatches: otherMatches.map((r) => r.item),
	};
};
