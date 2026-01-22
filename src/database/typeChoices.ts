// src/database/pokemonTypes.ts
export const POKEMON_TYPES = {
	normal: 'normal',
	fire: 'fire',
	water: 'water',
	electric: 'electric',
	grass: 'grass',
	ice: 'ice',
	fighting: 'fighting',
	poison: 'poison',
	ground: 'ground',
	flying: 'flying',
	psychic: 'psychic',
	bug: 'bug',
	rock: 'rock',
	ghost: 'ghost',
	dragon: 'dragon',
	dark: 'dark',
	steel: 'steel',
	fairy: 'fairy',
} as const;

export type TypeChoices = keyof typeof POKEMON_TYPES;

export const TYPE_CHOICES = Object.keys(POKEMON_TYPES) as TypeChoices[];

export const typeChoices = TYPE_CHOICES.map((type) => ({
	name: type.charAt(0).toUpperCase() + type.slice(1),
	value: type,
}));
