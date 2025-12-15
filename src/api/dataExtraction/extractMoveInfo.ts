import { MoveDataSchema, type MoveData } from '../z-schemas/apiSchemas';
import { formatName } from '~/utility/formatting/formatName';

// export interface MoveInfo {
// 	name: string;
// 	stat_changes: {
// 		change: number;
// 		stat: {
// 			name: string;
// 		};
// 	}[];
// 	accuracy: string;
// 	effect_entries: {
// 		effect: string;
// 		short_effect: string;
// 		language: {
// 			name: string;
// 		};
// 	}[];
// 	effect_chance: string;
// 	priority: string;
// 	power: string;
// 	pp: string;
// 	damage_class: string;
// 	type: string;
// 	target: string;
// 	generation: string;
// 	flavor_text: string;
// 	flavor_text_ver: string;
// 	learned_by_pokemon: string[];
// 	machines: string;
// 	meta: {
// 		ailment: {
// 			name: string;
// 		};
// 		stat_chance: number;
// 		ailment_chance: number;
// 		flinch_chance: number;
// 		crit_rate: number;
// 		drain: number;
// 		healing: number;
// 		min_hits: number | null;
// 		max_hits: number | null;
// 		min_turns: number | null;
// 		max_turns: number | null;
// 	};
// }

export type MoveInfo = ReturnType<typeof extractMoveInfo>;

export const extractMoveInfo = (rawData: unknown) => {
	const data: MoveData = MoveDataSchema.parse(rawData);

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

// export { extractMoveInfo };
