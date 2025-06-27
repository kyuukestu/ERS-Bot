interface AbilityData {
	name: string;
	effect_entries: {
		effect: string;
		language: { name: string };
		effect_chance: string;
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

export type { AbilityData };
