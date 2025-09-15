import { PokemonDataSchema, type PokemonData } from '../../schemas/apiSchemas';
import { formatName } from '../formatting/formatName';
import { getTypeEmoji } from '../../ui/emojis';

export const extractPokemonInfo = (rawData: unknown) => {
	const data: PokemonData = PokemonDataSchema.parse(rawData);

	const { id, name, weight, height, types, stats, sprites, abilities, moves } =
		data;

	return {
		id,
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
