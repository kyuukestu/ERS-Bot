// services/PokemonSearchService.ts

import Fuse from 'fuse.js';
import pokemonListRaw from '../../../public/json/pokemon-list.json';

export type PokemonSearchEntry = {
	name: string;
	speciesName: string;
	sprite: string | null;

	types: string[];
	abilities: string[];

	stats: {
		hp: number;
		attack: number;
		defense: number;
		'special-attack': number;
		'special-defense': number;
		speed: number;
	};

	formName?: string;
};

const pokemonList: PokemonSearchEntry[] = pokemonListRaw.map((pokemon) => ({
	name: pokemon.name,
	speciesName: pokemon.speciesName,
	sprite: pokemon.sprite,
	types: pokemon.types,
	abilities: pokemon.abilities,
	stats: pokemon.stats,
	formName: pokemon.formName ?? undefined,
}));

class PokemonSearchService {
	private fuse: Fuse<PokemonSearchEntry>;

	constructor() {
		this.fuse = new Fuse(pokemonList, {
			keys: ['name', 'speciesName', 'formName'],
			threshold: 0.3,
			ignoreLocation: true,
		});
	}

	search(query: string) {
		if (!query) {
			return pokemonList.slice(0, 25);
		}

		return this.fuse
			.search(query)
			.slice(0, 25)
			.map((result) => result.item);
	}
}

export const pokemonSearchService = new PokemonSearchService();
