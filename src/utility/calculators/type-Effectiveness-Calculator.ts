import { ALL_TYPES, type PokemonType } from '~/database/pokemonTypes';
import { TYPE_CHART } from '~/database/typeChart';

export function calculateOffense(
	types: PokemonType[]
): Record<PokemonType, number> {
	const result: Record<PokemonType, number> = {} as Record<PokemonType, number>;

	for (const target of ALL_TYPES) {
		result[target] = Math.max(
			...types.map((t) => TYPE_CHART[t]?.[target] ?? 1)
		);
	}

	return result;
}

export function calculateDefense(
	types: PokemonType[]
): Record<PokemonType, number> {
	const result: Record<PokemonType, number> = {} as Record<PokemonType, number>;

	for (const attacker of ALL_TYPES) {
		result[attacker] = types.reduce(
			(total, t) => total * (TYPE_CHART[attacker]?.[t] ?? 1),
			1
		);
	}

	return result;
}
