export type LearnMethodKey = 'level-up' | 'machine' | 'tutor' | 'egg' | 'other';

export type MoveMethod = {
	method: LearnMethodKey;
	level?: number;
	version: string;
};

export type NormalizedMove = {
	name: string;
	methods: MoveMethod[];
};

export interface GroupedMove {
	name: string;
	level?: number;
	version: string;
	otherMethods: LearnMethodKey[];
}

export type GroupedMoves = Record<LearnMethodKey, GroupedMove[]>;

export interface LearnMethodConfig {
	[key: string]: {
		label: string;
		emoji: string;
		color: number;
	};
}

export interface PaginationState {
	methodIndex: number;
	page: number;
}
