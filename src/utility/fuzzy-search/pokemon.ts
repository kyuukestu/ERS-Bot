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
const pokemonList = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Configure Fuse
const fuse = new Fuse(pokemonList, {
	keys: ['formName', 'speciesName'], // search both form and base names
	includeScore: true,
	threshold: 0.3, // tweak for fuzzy sensitivity
});

// Function to match user input to Pokémon
export function matchPokemonSpecies(userInput: string) {
	const results = fuse.search(userInput);

	if (results.length === 0) {
		throw new Error(`No Pokémon found for "${userInput}".`);
	}

	console.log('Matches: :', results);

	// Pick the top match
	const bestMatch = results[0].item as {
		speciesName: string;
		formName?: string;
		sprite: string;
	};

	// Always return the base species name
	return {
		speciesName: bestMatch.speciesName,
		formName: bestMatch.formName, // optional, if you want the specific form
		sprite: bestMatch.sprite,
	};
}
