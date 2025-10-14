import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Utility delay to avoid overloading the API
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const fetchAllMoves = async () => {
	console.log('⚔️ Fetching all Pokémon moves...');

	try {
		const { data } = await axios.get(
			'https://pokeapi.co/api/v2/move?limit=10000'
		);
		const results = data.results;

		console.log(`📜 Found ${results.length} moves. Fetching details...`);

		const outputDir = path.resolve('./public/json');
		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

		const outputPath = path.join(outputDir, 'moves-list.json');

		const movesData: any[] = [];

		for (let i = 0; i < results.length; i++) {
			const move = results[i];

			try {
				const { data: details } = await axios.get(move.url);

				movesData.push({
					id: details.id,
					name: details.name,
					type: details.type?.name || 'unknown',
					category: details.damage_class?.name || 'status',
					power: details.power || null,
					pp: details.pp || null,
					accuracy: details.accuracy || null,
					priority: details.priority || 0,
					target: details.target?.name || 'unknown',
					effect: details.effect_entries?.[0]?.short_effect || null,
					stat_changes: details.stat_changes || [],
					meta: details.meta || null,
				});

				if (i % 25 === 0) {
					console.log(`💾 Progress: ${i}/${results.length} moves fetched`);
					// Save partial progress every 25 moves
					fs.writeFileSync(outputPath, JSON.stringify(movesData, null, 2));
				}

				// Avoid hammering the API
				await delay(100);
			} catch (err: any) {
				console.warn(`⚠️ Failed to fetch move ${move.name}: ${err.message}`);
				await delay(500);
			}
		}

		// Write final file
		fs.writeFileSync(outputPath, JSON.stringify(movesData, null, 2));

		console.log(
			`✅ Successfully saved ${movesData.length} moves to ${outputPath}`
		);
	} catch (err: any) {
		console.error(`❌ Failed to fetch moves: ${err.message}`);
	}
};

fetchAllMoves();
