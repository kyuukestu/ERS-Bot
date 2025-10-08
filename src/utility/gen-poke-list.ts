import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface PokemonForm {
	name: string;
	speciesName: string;
	formName?: string;
	sprite: string;
	types: string[];
	abilities: string[];
	stats: Record<string, number>;
}

const fetchAllPokemons = async () => {
	try {
		// 1. Fetch all Pokémon
		const { data } = await axios.get(
			'https://pokeapi.co/api/v2/pokemon?limit=10000'
		);
		const results = data.results;

		// 2. Fetch details + flatten forms
		const detailed: PokemonForm[] = [];

		for (let index = 0; index < results.length; index++) {
			const p = results[index];
			try {
				const { data: details } = await axios.get(p.url);

				const baseName = details.name;

				// Each form becomes its own entry
				details.forms.forEach((f: any) => {
					detailed.push({
						name: f.name,
						speciesName: baseName,
						formName:
							f.name !== baseName
								? f.name.replace(`${baseName}-`, '')
								: undefined,
						sprite: f.sprites?.front_default || details.sprites.front_default,
						types: details.types.map((t: any) => t.type.name),
						abilities: details.abilities.map((a: any) => a.ability.name),
						stats: Object.fromEntries(
							details.stats.map((s: any) => [s.stat.name, s.base_stat])
						),
					});
				});
			} catch (err: any) {
				console.error(
					`❌ Failed to fetch details for ${p.name}: ${err.message}`
				);
			}
		}

		// Ensure output directory exists
		const outputDir = path.resolve('./public/json');
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		// Write JSON file
		const outputPath = path.join(outputDir, 'pokemon-list.json');
		fs.writeFileSync(outputPath, JSON.stringify(detailed, null, 2));

		console.log(`✅ Flattened Pokémon list saved to ${outputPath}`);
	} catch (err: any) {
		console.error(`❌ Failed to fetch Pokémon list: ${err.message}`);
	}
};

fetchAllPokemons();
