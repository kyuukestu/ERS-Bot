import { z } from 'zod';

/* ---------------------------- Ability Schema ---------------------------- */
export const AbilityDataSchema = z.object({
	name: z.string(),
	effect_entries: z.array(
		z.object({
			effect: z.string(),
			language: z.object({ name: z.string() }),
			effect_chance: z.string().optional(),
		})
	),
	pokemon: z.array(
		z.object({
			is_hidden: z.boolean(),
			pokemon: z.object({ name: z.string() }),
		})
	),
	generation: z.object({ name: z.string() }),
});

export type AbilityData = z.infer<typeof AbilityDataSchema>;

/* ----------------------------- Item Schema ------------------------------ */
export const ItemDataSchema = z.object({
	name: z.string(),
	category: z.object({ name: z.string() }),
	cost: z.number(),
	fling_power: z.number().nullable(),
	fling_effect: z.object({ name: z.string().optional() }).nullable(),
	effect_entries: z.array(
		z.object({
			effect: z.string(),
			language: z.object({ name: z.string() }),
		})
	),
	flavor_text_entries: z.array(
		z.object({
			language: z.object({ name: z.string() }),
			text: z.string(),
			version_group: z.object({ name: z.string() }),
		})
	),
	sprites: z.object({
		default: z.string().nullable(),
	}),
});

export type ItemData = z.infer<typeof ItemDataSchema>;

/* ----------------------------- Move Schema ------------------------------ */
export const MoveDataSchema = z.object({
	name: z.string(),
	stat_changes: z.array(
		z.object({
			change: z.number(),
			stat: z.object({ name: z.string() }),
		})
	),
	accuracy: z.number().nullable().optional(),
	effect_chance: z.number().nullable().optional(),
	effect_entries: z.array(
		z.object({
			effect: z.string(),
			short_effect: z.string(),
			language: z.object({ name: z.string() }),
		})
	),
	priority: z.number(),
	power: z.number().nullable().optional(),
	pp: z.number().nullable().optional(),
	damage_class: z.object({ name: z.string() }),
	type: z.object({ name: z.string() }),
	target: z.object({ name: z.string() }).nullable().optional(),
	generation: z.object({ name: z.string() }).nullable().optional(),
	flavor_text_entries: z.array(
		z.object({
			flavor_text: z.string(),
			language: z.object({ name: z.string() }),
			version_group: z.object({ name: z.string() }),
		})
	),
	learned_by_pokemon: z.array(z.object({ name: z.string() })),
	machines: z.array(
		z.object({
			machine: z.object({ url: z.string() }),
			version_group: z.object({ name: z.string() }),
		})
	),
	meta: z.object({
		ailment: z.object({ name: z.string() }),
		stat_chance: z.number(),
		ailment_chance: z.number(),
		flinch_chance: z.number(),
		crit_rate: z.number(),
		drain: z.number(),
		healing: z.number(),
		min_hits: z.number().nullable(),
		max_hits: z.number().nullable(),
		min_turns: z.number().nullable(),
		max_turns: z.number().nullable(),
	}),
});

export type MoveData = z.infer<typeof MoveDataSchema>;

/* ---------------------------- Pokémon Schema ---------------------------- */
export const PokemonDataSchema = z.object({
	id: z.number(),
	name: z.string(),
	types: z.array(
		z
			.union([z.string(), z.object({ type: z.object({ name: z.string() }) })])
			.transform((t) => (typeof t === 'string' ? t : t.type.name))
	),
	abilities: z
		.array(
			z.union([
				z.string(),
				z.object({
					ability: z.object({ name: z.string() }),
					is_hidden: z.boolean(),
				}),
			])
		)
		.transform((arr) =>
			arr.map((a) =>
				typeof a === 'string' ? { ability: { name: a }, is_hidden: false } : a
			)
		),
	height: z.union([z.number(), z.string()]).transform((h) => {
		return Number(h);
	}),
	weight: z.union([z.number(), z.string()]).transform((w) => {
		return Number(w);
	}),
	stats: z.array(
		z.object({ stat: z.object({ name: z.string() }), base_stat: z.number() })
	),
	sprites: z.object({
		front_default: z.string().nullable(),
		front_shiny: z.string().nullable(),
		back_default: z.string().nullable(),
		back_shiny: z.string().nullable(),
		other: z.object({
			dream_world: z.object({ front_default: z.string().nullable() }),
			'official-artwork': z.object({
				front_default: z.string().nullable(),
				front_shiny: z.string().nullable(),
			}),
		}),
	}),
	moves: z.array(
		z.object({
			move: z.object({ name: z.string() }),
			version_group_details: z.array(
				z.object({
					level_learned_at: z.number(),
					move_learn_method: z.object({ name: z.string() }),
					version_group: z.object({ name: z.string() }),
				})
			),
		})
	),
});

export type PokemonData = z.infer<typeof PokemonDataSchema>;

/* ---------------------------- Species Schema ---------------------------- */
export const SpeciesDataSchema = z.object({
	egg_groups: z.array(z.object({ name: z.string() })),
	evolution_chain: z
		.object({
			url: z.string(),
		})
		.optional()
		.nullable(),
	evolves_from_species: z.object({ name: z.string() }).optional().nullable(),
	habitat: z.object({ name: z.string() }).optional().nullable(),
	generation: z.object({ name: z.string() }),
	flavor_text_entries: z.array(
		z.object({
			flavor_text: z.string(),
			language: z.object({ name: z.string() }),
			version: z.object({ name: z.string() }),
		})
	),
	pokedex_numbers: z.array(
		z.object({
			entry_number: z.number(),
			pokedex: z.object({ name: z.string() }),
		})
	),
	growth_rate: z.object({ name: z.string() }),
	capture_rate: z.number(),
});

export type SpeciesData = z.infer<typeof SpeciesDataSchema>;

export const ParsedSpeciesDataSchema = z.object({
	egg_groups: z.string(),
	evolution_chain: z.string(),
	evolves_from_species: z.string(),
	habitat: z.string(),
	generation: z.string(),
	generation_num: z.number(),
	gen_emoji: z.string(),
	flavor_text_entries: z.array(
		z.object({
			flavor_text: z.string(),
			language: z.object({ name: z.string() }),
			version: z.object({ name: z.string() }),
		})
	),
	pokedex_numbers: z.union([z.number(), z.string()]),
	growth_rate: z.string(),
	capture_rate: z.number(),
	capture_percentage: z.string(),
});

export type ParsedSpeciesData = z.infer<typeof ParsedSpeciesDataSchema>;

/* ---------------------------- Type Schema ---------------------------- */

export const TypeDataSchema = z.object({
	id: z.number(),
	name: z.string(),
	sprites: z.record(
		z.string(), // generation name (e.g., "generation-vii")
		z.record(
			z.string(), // version name (e.g., "brilliant-diamond-and-shining-pearl")
			z.object({
				name_icon: z.string(),
			})
		)
	),
});

export type TypeData = z.infer<typeof TypeDataSchema>;

/* --------------------------- Export Collection -------------------------- */
export const Schemas = {
	AbilityData: AbilityDataSchema,
	ItemData: ItemDataSchema,
	MoveData: MoveDataSchema,
	PokemonData: PokemonDataSchema,
	SpeciesData: SpeciesDataSchema,
	ParsedSpeciesData: ParsedSpeciesDataSchema,
	TypeData: TypeDataSchema,
};
