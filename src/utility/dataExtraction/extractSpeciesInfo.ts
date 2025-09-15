import { SpeciesDataSchema, type SpeciesData } from '../../schemas/apiSchemas';
import { gen_num_convert } from '../formatting/formatGen';
import { getGenerationEmoji } from '../../ui/emojis';

export const extractSpeciesInfo = (rawData: unknown) => {
	const data: SpeciesData = SpeciesDataSchema.parse(rawData);

	const {
		egg_groups,
		evolves_from_species,
		habitat,
		generation,
		flavor_text_entries,
		pokedex_numbers,
		growth_rate,
		capture_rate,
	} = data;

	const generation_parsed =
		generation?.name.replace('generation-', '') ?? 'unknown';
	const generation_num = gen_num_convert(generation_parsed);

	return {
		egg_groups:
			egg_groups.length > 0
				? egg_groups
						.map((eg) => eg.name.charAt(0).toUpperCase() + eg.name.slice(1))
						.join(', ')
				: 'Unknown',
		evolves_from_species: evolves_from_species
			? `⬅️ Evolves from: **${
					evolves_from_species.name.charAt(0).toUpperCase() +
					evolves_from_species.name.slice(1)
			  }**`
			: '🥚 Base form',
		habitat: habitat
			? habitat.name.charAt(0).toUpperCase() + habitat.name.slice(1)
			: 'Unknown',
		generation: generation_parsed,
		generation_num: generation_num,
		gen_emoji: getGenerationEmoji(generation_num) ?? '❓',
		flavor_text_entries,
		pokedex_numbers:
			pokedex_numbers.filter((pe) => pe.pokedex.name === 'national')[0]
				?.entry_number ?? 'Unknown',
		growth_rate:
			growth_rate?.name
				.split('-')
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join(' ') ?? 'Unknown',
		capture_rate: capture_rate ?? 0,
		capture_percentage: ((capture_rate / 255) * 100).toFixed(2),
	};
};
