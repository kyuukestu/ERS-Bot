import Fuse from 'fuse.js';
import path from 'path';
import fs from 'fs';

// Load item list
const filePath = path.resolve('./public/json/items-list.json');
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

	return { bestMatch, otherMatches };
};
