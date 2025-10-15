import axios from 'axios';
import fs from 'fs';
import path from 'path';

const fetchAllItems = async () => {
	try {
		console.log('📦 Fetching all items...');

		// Fetch the list of item URLs
		const { data } = await axios.get(
			'https://pokeapi.co/api/v2/item?limit=10000'
		);
		const results = data.results; // [{ name, url }, ...]

		// Fetch details for each item
		const detailed = await Promise.all(
			results.map(async (i) => {
				try {
					const { data: details } = await axios.get(i.url);

					return {
						id: details.id,
						name: details.name,
						category: details.category?.name || null,
						cost: details.cost,
						attributes: details.attributes?.map((a: any) => a.name) || [],
						effect_entries:
							details.effect_entries?.map((e: any) => ({
								effect: e.effect,
								short_effect: e.short_effect,
								language: e.language.name,
							})) || [],
						flavor_text_entries:
							details.flavor_text_entries
								?.filter((f: any) => f.language.name === 'en')
								.map((f: any) => f.text) || [],
						sprites: details.sprites?.default || null,
					};
				} catch (err: any) {
					console.warn(
						`⚠️ Failed to fetch details for ${i.name}: ${err.message}`
					);
					return null;
				}
			})
		);

		// Filter out nulls
		const filtered = detailed.filter(Boolean);

		// Ensure output directory exists
		const outputDir = path.resolve('./public/json');
		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

		// Write to JSON
		const outputPath = path.join(outputDir, 'items-list.json');
		fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2));

		console.log(`✅ Item list saved to ${outputPath}`);
		console.log(`📊 Total items: ${filtered.length}`);
	} catch (err: any) {
		console.error(`❌ Failed to fetch item list: ${err.message}`);
	}
};

fetchAllItems();
