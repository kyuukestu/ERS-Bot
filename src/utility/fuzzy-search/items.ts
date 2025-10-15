import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import Fuse from 'fuse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(
	__dirname,
	'../../../public/json/items-list.json'
);
if (!fs.existsSync(filePath)) {
	throw new Error(`Item list not found at ${filePath}`);
}

const itemList = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const fuse = new Fuse(itemList, {
	keys: ['name'],
	includeScore: true,
	threshold: 0.3,
});

export const matchItemName = (userInput: string) => {
	const results = fuse.search(userInput);

	if (results.length === 0) {
		throw new Error('No items matched your search.');
	}

	const [bestMatch, ...otherMatches] = results;

	return {
		bestMatch: bestMatch.item,
		otherMatches: otherMatches.map((r) => r.item),
	};
};
