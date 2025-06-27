interface PokemonData {
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

export type { PokemonData };
