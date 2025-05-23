interface MoveData {
	name: string;
	accuracy?: number;
	effect_chance?: number;
	priority: number;
	power?: number;
	damage_class: { name: string };
	type: { name: string };
	flavor_text_entries: {
		flavor_text: string;
		language: {
			name: string;
		};
		version_group: {
			name: string;
		};
	}[];
	learned_by_pokemon: {
		name: string;
	}[];
}

export type { MoveData };
