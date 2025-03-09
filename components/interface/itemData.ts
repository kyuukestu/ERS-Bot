interface ItemData {
	name: string;
	fling_power: number;
	fling_effect: { name?: string };
	effect_entries: { effect: string }[];
	flavor_text_entries: { text: string }[];
	sprites: {
		default: string;
	};
}

export type { ItemData };
