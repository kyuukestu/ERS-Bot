export interface AbilityData {
	name: string;
	effect_entries: {
		effect: string;
		language: { name: string };
		effect_chance?: string;
	}[];
	pokemon: {
		is_hidden: boolean;
		pokemon: {
			name: string;
		};
	}[];
	generation: {
		name: string;
	};
}

export interface ItemData {
	name: string;
	category: { name: string };
	cost: number;
	fling_power: number;
	fling_effect: { name?: string };
	effect_entries: {
		effect: string;
		language: {
			name: string;
		};
	}[];
	flavor_text_entries: {
		language: {
			name: string;
		};
		text: string;
		version_group: {
			name: string;
		};
	}[];
	sprites: {
		default: string;
	};
}

export interface MoveData {
	name: string;
	stat_changes: { change: number; stat: { name: string } }[];
	accuracy?: number | null;
	effect_chance?: number | null;
	effect_entries: {
		effect: string;
		short_effect: string;
		language: { name: string };
	}[];
	priority: number;
	power?: number | null;
	pp?: number | null;
	damage_class: { name: string };
	type: { name: string };
	target?: { name: string } | null;
	generation?: { name: string } | null;
	flavor_text_entries: {
		flavor_text: string;
		language: { name: string };
		version_group: { name: string };
	}[];
	learned_by_pokemon: { name: string }[];
	machines: {
		machine: { url: string };
		version_group: { name: string };
	}[];
	meta: {
		ailment: { name: string };
		stat_chance: number;
		ailment_chance: number;
		flinch_chance: number;
		crit_rate: number;
		drain: number;
		healing: number;
		min_hits: number | null;
		max_hits: number | null;
		min_turns: number | null;
		max_turns: number | null;
	};
}

export interface PokemonData {
	id: number;
	name: string;
	types: { type: { name: string } }[];
	abilities: {
		ability: { name: string };
		is_hidden: boolean;
	}[];
	height: number;
	weight: number;
	stats: { stat: { name: string }; base_stat: number }[];
	sprites: {
		front_default: string; // Default front sprite
		front_shiny: string; // Shiny front sprite
		back_default: string; // Default back sprite
		back_shiny: string; // Shiny back sprite
		other: {
			dream_world: { front_default: string };
			'official-artwork': {
				front_default: string; // Official artwork sprite
				front_shiny: string; // Shiny official artwork sprite
			};
		};
	};
	moves: {
		move: { name: string };
		version_group_details: {
			level_learned_at: number;
			move_learn_method: { name: string };
			version_group: { name: string };
		}[];
	}[];
}

export interface SpeciesData {
	egg_groups: {
		name: string;
	}[];
	evolves_from_species?: {
		name: string;
	};
	habitat?: { name: string };
	generation: {
		name: string;
	};
	flavor_text_entries: {
		flavor_text: string;
		language: {
			name: string;
		};
		version: {
			name: string;
		};
	}[];
	pokedex_numbers: {
		entry_number: number;
		pokedex: {
			name: string;
		};
	}[];
	growth_rate: {
		name: string;
	};
	capture_rate: number;
}