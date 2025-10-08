import axios from 'axios';
import fs from 'fs';
import path from 'path';

const fetchAllPokemons = async () => {
	try {
		console.log('📦 Fetching all Pokémon...');
		const { data } = await axios.get(
			'https://pokeapi.co/api/v2/pokemon?limit=10000'
		);
		const results = data.results;

		const detailed = await Promise.all(
			results.map(async (p, index) => {
				try {
					// Fetch the main Pokémon details
					const { data: details } = await axios.get(p.url);

					// Fetch species to get base species name
					const speciesUrl = details.species?.url;
					let speciesName = details.species?.name || p.name;

					if (speciesUrl) {
						try {
							const { data: speciesData } = await axios.get(speciesUrl);
							speciesName = speciesData.name; // override with proper base species
						} catch (err: any) {
							console.warn(
								`⚠️ Could not fetch species for ${p.name}: ${err.message}`
							);
						}
					}

					// Extract forms (some Pokémon have multiple entries here)
					const forms = await Promise.all(
						details.forms.map(async (f: any) => {
							try {
								const { data: formData } = await axios.get(f.url);
								return {
									formName: formData.name,
									sprite:
										formData.sprites?.front_default ||
										details.sprites.front_default ||
										null,
									speciesName,
									types: details.types.map((t: any) => t.type.name),
									abilities: details.abilities.map((a: any) => a.ability.name),
									stats: Object.fromEntries(
										details.stats.map((s: any) => [s.stat.name, s.base_stat])
									),
								};
							} catch {
								return {
									id: index + 1,
									formName: f.name,
									sprite: details.sprites.front_default,
									speciesName,
									types: details.types.map((t: any) => t.type.name),
									abilities: details.abilities.map((a: any) => a.ability.name),
									stats: Object.fromEntries(
										details.stats.map((s: any) => [s.stat.name, s.base_stat])
									),
								};
							}
						})
					);

					return forms; // return all forms flattened later
				} catch (err: any) {
					console.error(
						`❌ Failed to fetch details for ${p.name}: ${err.message}`
					);
					return [];
				}
			})
		);

		// Flatten nested arrays
		const flattened = detailed.flat();

		// Ensure output directory exists
		const outputDir = path.resolve('./public/json');
		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

		// Write to JSON
		const outputPath = path.join(outputDir, 'species-list.json');
		fs.writeFileSync(outputPath, JSON.stringify(flattened, null, 2));

		console.log(`✅ Pokémon list saved to ${outputPath}`);
		console.log(`📊 Total Pokémon Forms: ${flattened.length}`);
	} catch (err: any) {
		console.error(`❌ Failed to fetch Pokémon list: ${err.message}`);
	}
};

fetchAllPokemons();
