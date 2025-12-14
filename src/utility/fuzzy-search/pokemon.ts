import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import Fuse from 'fuse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(
	__dirname,
	'../../../public/json/species-list.json'
);
if (!fs.existsSync(filePath)) {
	throw new Error(`Pokémon list not found at ${filePath}`);
}

interface Pokemon {
	speciesName: string;
	formName?: string;
	sprite: string;
}

const pokemonList: Pokemon[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Configure Fuse
const fuse = new Fuse(pokemonList, {
	keys: [
		{ name: 'formName', weight: 0.8 },
		{ name: 'speciesName', weight: 0.2 },
	], // search both form and base names
	includeScore: true,
	threshold: 0.3, // tweak for fuzzy sensitivity
});

// Function to match user input to Pokémon
export function matchPokemonSpecies(userInput: string) {
	const normalized = userInput.toLowerCase().trim();

	const exact = pokemonList.find(
		(p) => p.speciesName.toLowerCase() === normalized
	);

	if (exact) {
		return {
			speciesName: exact.speciesName,
			formName: exact.formName,
			sprite: exact.sprite,
			firstMatch: exact.formName || exact.speciesName,
			otherMatches: [],
		};
	}

	const results = fuse.search(normalized);

	if (results.length === 0) {
		throw new Error(`No Pokémon found for "${userInput}".`);
	}

	console.log('Normalized: ', normalized, 'Matches: :', results);

	// Pick the top match
	const bestMatch = results[0].item as {
		speciesName: string;
		formName?: string;
		sprite: string;
	};

	const [firstMatch, ...otherMatches] = results;

	// Always return the base species name
	return {
		speciesName: bestMatch.speciesName,
		formName: bestMatch.formName, // optional, if you want the specific form
		sprite: bestMatch.sprite,
		firstMatch:
			firstMatch.item.formName?.includes('arcues') ||
			firstMatch.item.formName?.includes('silvally')
				? firstMatch.item.speciesName
				: firstMatch.item.formName || firstMatch.item.speciesName,
		otherMatches: otherMatches.map((match) => ({
			speciesName: match.item.formName,
		})),
	};
}
