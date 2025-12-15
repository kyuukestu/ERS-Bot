import { AbilityDataSchema, type AbilityData } from '../z-schemas/apiSchemas';
import { abilityColors } from '../../ui/colors';
import { abilityEmojis } from '../../ui/emojis';
import { formatName } from '~/utility/formatting/formatName';

// export interface AbilityInfo {
// 	name: string;
// 	color: number;
// 	emoji: string;
// 	generation: string;
// 	effect: string;
// 	effectChance: string;
// 	pokemon?: string[];
// 	category: string;
// }

export type AbilityInfo = ReturnType<typeof extractAbilityInfo>;

export const extractAbilityInfo = (rawData: unknown) => {
	const data: AbilityData = AbilityDataSchema.parse(rawData);

	// Destructure the data object
	const { name, effect_entries, pokemon, generation } = data;

	// Transform name to title case
	const formattedName = formatName(name);

	// Get English effect description
	const effect =
		effect_entries.find((e) => e.language.name === 'en')?.effect ??
		'No English description available';

	// Get effect chance
	const effectChance =
		effect_entries.find((e) => e.language.name === 'en')?.effect_chance ??
		'N/A';

	// Format generation
	const formattedGeneration =
		generation.name.replace('generation-', '') ?? 'Unknown';

	const pokemonList = pokemon.map(
		({ pokemon: { name } }) => name.charAt(0).toUpperCase() + name.slice(1)
	);

	// Determine ability category
	const category = effect_entries.some(
		(e) => e.effect.includes('attack') ?? e.effect.includes('damage')
	)
		? 'offensive'
		: effect_entries.some(
				(e) => e.effect.includes('defense') ?? e.effect.includes('reduce')
		  )
		? 'defensive'
		: effect_entries.some(
				(e) => e.effect.includes('status') ?? e.effect.includes('boost')
		  )
		? 'utility'
		: 'other';

	const color = abilityColors[category] ?? abilityColors['other'];
	const emoji = abilityEmojis[category] ?? abilityEmojis['other'];

	return {
		name: formattedName,
		effect,
		effectChance,
		generation: formattedGeneration,
		pokemon: pokemonList,
		category,
		color,
		emoji,
	};
};
