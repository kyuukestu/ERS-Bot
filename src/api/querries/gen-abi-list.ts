import axios from 'axios';
import fs from 'fs';
import path from 'path';

const fetchAllAbilities = async () => {
	try {
		console.log('🧠 Fetching all abilities...');

		// Fetch the list of ability URLs
		const { data } = await axios.get(
			'https://pokeapi.co/api/v2/ability?limit=10000'
		);
		const results = data.results; // [{ name, url }, ...]

		// Fetch details for each ability
		const detailed = await Promise.all(
			results.map(async (a) => {
				try {
					const { data: details } = await axios.get(a.url);

					return {
						id: details.id,
						name: details.name, // canonical English slug
						is_main_series: details.is_main_series,

						names:
							details.names
								?.filter((n: any) => n.language.name === 'en')
								.map((n: any) => n.name) || [],

						effect_entries:
							details.effect_entries
								?.filter((e: any) => e.language.name === 'en')
								.map((e: any) => ({
									effect: e.effect,
									short_effect: e.short_effect,
								})) || [],

						flavor_text_entries:
							details.flavor_text_entries
								?.filter((f: any) => f.language.name === 'en')
								.map((f: any) => f.flavor_text) || [],

						generation: details.generation?.name || null,
					};
				} catch (err: any) {
					console.warn(
						`⚠️ Failed to fetch details for ${a.name}: ${err.message}`
					);
					return null;
				}
			})
		);

		// Filter out failures
		const filtered = detailed.filter(Boolean);

		// Ensure output directory exists
		const outputDir = path.resolve('./public/json');
		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

		// Write to JSON
		const outputPath = path.join(outputDir, 'abilities-list.json');
		fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2));

		console.log(`✅ Ability list saved to ${outputPath}`);
		console.log(`📊 Total abilities: ${filtered.length}`);
	} catch (err: any) {
		console.error(`❌ Failed to fetch ability list: ${err.message}`);
	}
};

fetchAllAbilities();
