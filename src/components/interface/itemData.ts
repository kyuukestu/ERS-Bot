interface ItemData {
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

export type { ItemData };
