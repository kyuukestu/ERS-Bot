interface MoveData {
	name: string;
	accuracy?: number | null;
	effect_chance?: number | null;
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
}
export type { MoveData };
