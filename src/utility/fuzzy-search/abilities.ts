import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import Fuse from 'fuse.js';

interface Ability {
	name: string;
	// add fields later if you decide to get fancy
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(
	__dirname,
	'../../../public/json/abilities-list.json'
);

if (!fs.existsSync(filePath)) {
	throw new Error(`Ability list not found at ${filePath}`);
}

const abilityList: Ability[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Optional normalization step for better fuzzy matching
const normalizedAbilities = abilityList.map((a) => ({
	...a,
	searchName: a.name.replace(/-/g, ' '),
}));

const fuse = new Fuse(normalizedAbilities, {
	keys: ['searchName'],
	includeScore: true,
	threshold: 0.3,
});

export const matchAbilityName = (
	userInput: string
): { bestMatch: Ability; otherMatches: Ability[] } => {
	const results = fuse.search(userInput);

	if (results.length === 0) {
		throw new Error('No abilities matched your search.');
	}

	const [bestMatch, ...otherMatches] = results;

	return {
		bestMatch: bestMatch.item,
		otherMatches: otherMatches.map((r) => r.item),
	};
};
