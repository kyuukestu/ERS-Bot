interface speciesData {
    egg_groups: {
        name: string;
    }[];
    evolves_from_species?: string;
    flavor_text_entries: {
        flavor_text: string;
        language: {
            name: string;
        }
        version: {
        name: string; }
    }[];
    pokedex_numbers: {
        entry_number: number;
        pokedex: {
            name: string;
        }
    }[];
}

export type {speciesData};