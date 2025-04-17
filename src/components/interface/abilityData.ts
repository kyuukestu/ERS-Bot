interface AbilityData {
	name: string;
	effect_entries: {
		effect: string;
		language: { name: string };
	}[];
}

export type { AbilityData };
