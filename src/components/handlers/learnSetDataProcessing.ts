import {
	PokemonDataSchema,
	type PokemonData,
} from '~/api/z-schemas/apiSchemas';
import type {
	LearnMethodKey,
	NormalizedMove,
	GroupedMove,
	GroupedMoves,
	MoveMethod,
} from '~/types/learnSetTypes';

export const normalizeLearnMethod = (method: string): LearnMethodKey => {
	if (method === 'level-up') return 'level-up';
	if (method === 'machine') return 'machine';
	if (method === 'tutor') return 'tutor';
	if (method === 'egg') return 'egg';
	return 'other';
};

export const formatMoveName = (name: string): string =>
	name
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');

export const processMoveData = (data: unknown): NormalizedMove[] => {
	const parsed: PokemonData = PokemonDataSchema.parse(data);

	return parsed.moves.map((move) => ({
		name: move.move.name,
		methods: move.version_group_details.map((detail) => ({
			method: normalizeLearnMethod(detail.move_learn_method.name),
			level: detail.level_learned_at || undefined,
			version: detail.version_group.name,
		})),
	}));
};

export const getLowestLevelUp = (methods: MoveMethod[]): number | undefined => {
	const levels = methods
		.filter(
			(m) => m.method === 'level-up' && m.level !== undefined && m.level > 0,
		)
		.map((m) => m.level);

	if (levels.length === 0) return undefined;
	const filteredLevels = levels.filter((level) => typeof level === 'number');
	return Math.min(...filteredLevels);
};

export const groupAndSortMoves = (moves: NormalizedMove[]): GroupedMoves => {
	const grouped: GroupedMoves = {
		'level-up': [],
		machine: [],
		tutor: [],
		egg: [],
		other: [],
	};

	for (const move of moves) {
		const uniqueMethods = new Set(move.methods.map((m) => m.method));

		for (const method of uniqueMethods) {
			if (method === 'level-up') {
				grouped['level-up'].push({
					name: formatMoveName(move.name),
					level: getLowestLevelUp(move.methods),
					version: '',
					otherMethods: [...uniqueMethods].filter((m) => m !== 'level-up'),
				});
				continue;
			}

			// non–level-up methods
			grouped[method].push({
				name: formatMoveName(move.name),
				version: move.methods.find((m) => m.method === method)?.version ?? '',
				otherMethods: [...uniqueMethods].filter((m) => m !== method),
			});
		}
	}

	grouped['level-up'].sort(
		(a, b) =>
			(a.level ?? Number.MAX_SAFE_INTEGER) -
			(b.level ?? Number.MAX_SAFE_INTEGER),
	);

	for (const key of ['machine', 'tutor', 'egg', 'other'] as const) {
		grouped[key].sort((a, b) => a.name.localeCompare(b.name));
	}

	return grouped;
};

export const formatMoveLine = (
	move: GroupedMove,
	method: LearnMethodKey,
	learnMethodConfig: Record<
		LearnMethodKey,
		{ label: string; emoji: string; color: number }
	>,
): string => {
	const altIcons =
		move.otherMethods.length > 0
			? ` ${move.otherMethods.map((m) => learnMethodConfig[m].emoji).join('')}`
			: '';

	if (method === 'level-up') {
		return move.level
			? `Lv.${move.level} | **${move.name}** ${altIcons}`
			: `Start.${move.level} **${move.name}** ${altIcons}`;
	}

	return `**${move.name}** ${altIcons} `;
};
