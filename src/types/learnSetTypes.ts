export type LearnMethodKey = 'level-up' | 'machine' | 'tutor' | 'egg' | 'other';

export type MoveMethod = {
	method: LearnMethodKey;
	level?: number;
	version: string;
};

export type FakeMoveMethod = {
	method: LearnMethodKey;
	level?: number;
};

export type NormalizedMove = {
	name: string;
	methods: MoveMethod[];
};

export type NormalizeFakemonMove = {
	name: string;
	methods: FakeMoveMethod[];
};

export interface GroupedMove {
	name: string;
	level?: number;
	version: string;
	otherMethods: LearnMethodKey[];
}

export interface FakeGroupedMove {
	name: string;
	level?: number;
	otherMethods: LearnMethodKey[];
}

export type GroupedMoves = Record<LearnMethodKey, GroupedMove[]>;

export type FakeGroupedMoves = Record<LearnMethodKey, FakeGroupedMove[]>;

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
