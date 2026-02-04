import pokemonList from '~/../public/json/pokemon-list.json';

export type MoveType = {
	id: number;
	name: string;
	type: string;
	category: string;
	power?: number | null;
	pp: number | null;
	accuracy?: number | null;
	priority: number;
	target: string;
	effect?: string | null;
	stat_changes: { change: number; stat: { name: string; url: string } }[];
	meta?: {
		ailment?: {
			name: string;
			url: string;
		} | null;
		ailment_chance: number;
		category: {
			name: string;
			url: string;
		};
		crit_rate: number;
		drain?: number | null;
		flinch_chance?: number | null;
		healing?: number | null;
		max_hits?: number | null;
		max_turns?: number | null;
		min_hits?: number | null;
		min_turns?: number | null;
		stat_chance?: number | null;
	} | null;
};

export type MoveListType = MoveType[];

export type PokemonList = typeof pokemonList;
