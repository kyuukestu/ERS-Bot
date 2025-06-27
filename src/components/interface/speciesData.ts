interface SpeciesData {
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

export type { SpeciesData };
