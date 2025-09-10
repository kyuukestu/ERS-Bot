import type {
	AbilityData,
	ItemData,
	MoveData,
	PokemonData,
	SpeciesData,
} from '../../components/interface/apiData';
import { abilityColors } from '../ui/colors';
import {
	abilityEmojis,
	getGenerationEmoji,
	getTypeEmoji,
	itemEmojis,
} from '../ui/emojis';

const formatName = (name: string) => {
	return name
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

const gen_num_convert = (gen: string) => {
	switch (gen) {
		case 'i':
			return 1;
		case 'ii':
			return 2;
		case 'iii':
			return 3;
		case 'iv':
			return 4;
		case 'v':
			return 5;
		case 'vi':
			return 6;
		case 'vii':
			return 7;
		case 'viii':
			return 8;
		case 'ix':
			return 9;
		default:
			return 0;
	}
};

const extractAbilityInfo = (data: AbilityData) => {
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

	// Get top 3 Pokémon names
	const pokemonList =
		pokemon
			.slice(0, 3)
			.map(
				({ pokemon: { name } }) => name.charAt(0).toUpperCase() + name.slice(1)
			)
			.join(', ') + (pokemon.length > 3 ? '...' : '');

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

const extractMoveInfo = (data: MoveData) => {
	const {
		name,
		stat_changes,
		accuracy,
		effect_entries,
		effect_chance,
		priority,
		power,
		pp,
		damage_class,
		type,
		target,
		generation,
		flavor_text_entries,
		learned_by_pokemon,
		machines,
		meta,
	} = data;

	const formattedName = formatName(name);

	const accuracyPercentage =
		accuracy !== null && accuracy !== undefined ? `${accuracy}%` : 'N/A';

	const effectChance =
		effect_chance !== null && effect_chance !== undefined
			? `${effect_chance}%`
			: 'N/A';

	const pasrsedPower =
		power !== null && power !== undefined ? power.toString() : 'N/A';

	const parsedPP = pp !== null && pp !== undefined ? pp.toString() : 'N/A';

	return {
		name: formattedName,
		stat_changes: stat_changes,
		accuracy: accuracyPercentage,
		effect_entries: effect_entries,
		effect_chance: effectChance,
		priority: priority.toString(),
		power: pasrsedPower,
		pp: parsedPP,
		damage_class: damage_class.name,
		type: type.name,
		target: target?.name ?? 'N/A',
		generation: generation?.name ?? 'N/A',
		flavor_text:
			flavor_text_entries.find((e) => e.language.name === 'en')?.flavor_text ??
			'N/A',
		flavor_text_ver:
			flavor_text_entries.find((e) => e.language.name === 'en')?.version_group
				.name ?? 'N/A',
		learned_by_pokemon:
			learned_by_pokemon.map(
				(pokemon) =>
					pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
			) ?? 'N/A',
		machines:
			machines.map((machine) => machine.machine.url).join(', ') ?? 'N/A',
		meta: meta,
	};
};

const extractItemInfo = (data: ItemData) => {
	const {
		name,
		category,
		cost,
		effect_entries,
		flavor_text_entries,
		sprites,
		fling_power,
		fling_effect,
	} = data;

	const formattedName = formatName(name);
	const itemEmoji = itemEmojis[category?.name] ?? itemEmojis['other'];

	return {
		name: formattedName,
		category: category?.name ?? 'other',
		item_emoji: itemEmoji,
		cost: cost ?? 0,
		effect:
			effect_entries.filter((entry) => entry.language.name === 'en').pop()
				?.effect ?? 'No English description available',
		flavor_text_entries:
			flavor_text_entries.filter((entry) => entry.language.name === 'en').pop()
				?.text ?? 'No English description available',
		flavor_text_ver:
			flavor_text_entries.filter((ft) => ft.language.name === 'en').pop()
				?.version_group.name ?? 'Unknown',
		sprite: sprites.default ?? '',
		fling_power: fling_power ?? 0,
		fling_effect: fling_effect?.name ?? 'N/A',
	};
};

const extractPokemonInfo = (data: PokemonData) => {
	const { name, weight, height, types, stats, sprites, abilities, moves } =
		data;

	return {
		name: formatName(name),
		weight: (weight / 10).toFixed(2) + 'kg',
		height: (height / 10).toFixed(2) + 'm',
		types: types.map(
			(t) =>
				`${getTypeEmoji(t.type.name)} ${
					t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)
				}`
		),
		abilities: abilities.map((a) => {
			const abilityName = a.ability.name
				.split('-')
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join(' ');
			return a.is_hidden ? `*${abilityName}* (Hidden)` : abilityName;
		}),
		stats,
		sprites,
		moves,
	};
};

const extractSpeciesInfo = (data: SpeciesData) => {
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

export {
	extractAbilityInfo,
	extractMoveInfo,
	extractItemInfo,
	extractPokemonInfo,
	extractSpeciesInfo,
};
