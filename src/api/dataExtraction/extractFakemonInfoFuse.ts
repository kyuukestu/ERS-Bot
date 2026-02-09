import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import Fuse from 'fuse.js';
import type { LearnMethodKey } from '~/types/learnSetTypes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(
	__dirname,
	'../../../public/json/fakemon-list.json',
);
if (!fs.existsSync(filePath)) {
	throw new Error(`Fakemon list not found at ${filePath}`);
}

export interface Fakemon {
	name: string;
	speciesName?: string | null;
	sprite: string | null;
	types: string[];
	abilities: string[];
	stats: {
		hp: number;
		attack: number;
		defense: number;
		'special-attack': number;
		'special-defense': number;
		speed: number;
	};
	moves: {
		name: LearnMethodKey;
		methods: [{ method: string; level: number }];
	}[];
}

const fakemonList: Fakemon[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const fuse = new Fuse(fakemonList, {
	keys: [
		{ name: 'name', weight: 0.8 },
		{ name: 'speciesName', weight: 0.2 },
	], // search both form and base names
	includeScore: true,
	threshold: 0.3, // tweak for fuzzy sensitivity
});

export function matchFakemonName(userInput: string) {
	const results = fuse.search(userInput.toLowerCase().trim());

	if (results.length === 0) {
		throw new Error('No fakemon matched your search.');
	}

	const [bestMatch, ...otherMatches] = results;

	return {
		bestMatch: bestMatch.item.name,
		otherMatches: otherMatches.map((r) => r.item.name),
	};
}

export const extractFakemonInfo = async (userInput: string) => {
	const match = matchFakemonName(userInput);

	const best = match.bestMatch.toLowerCase();

	console.log(best);
	// console.log(fakemonList);

	const fakemonInfo: Partial<Fakemon> | undefined =
		// try exact name match
		fakemonList.find((f) => f.name.toLowerCase() === best) ||
		// try speciesName if present in the data
		fakemonList.find(
			(f) => ((f as Fakemon).speciesName || '').toLowerCase() === best,
		) ||
		// fall back to any of the other fuzzy matches
		fakemonList.find((f) =>
			match.otherMatches
				.map((m) => m.toLowerCase())
				.includes(f.name.toLowerCase()),
		);

	if (!fakemonInfo) {
		console.error(`Fakemon "${userInput}" not found after matching.`);
		throw new Error(`Fakemon "${userInput}" not found after matching.`);
	}

	console.log(fakemonInfo);
	return fakemonInfo;
};
