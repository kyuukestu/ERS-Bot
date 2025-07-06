const { fetch } = require('node-fetch');

const pokemonEndPoint = async (pokemonName: string) => {
	// Fetch Pokémon data from PokeAPI
	const response = await fetch(
		`https://pokeapi.co/api/v2/pokemon/${pokemonName}`
	);
	if (!response.ok) {
		throw new Error(`Pokémon not found: ${pokemonName}`);
	}

	return await response.json();
};

const speciesEndPoint = async (speciesName: string) => {
	const response = await fetch(
		`https://pokeapi.co/api/v2/pokemon-species/${speciesName}`
	);
	if (!response.ok) {
		throw new Error(`Pokémon not found: ${speciesName}`);
	}

	return await response.json();
};

const moveEndPoint = async (moveName?: string) => {
	if (moveName) {
		// Fetch moved data from PokeAPI
		const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
		if (!response.ok) {
			throw new Error(`Move not found: ${moveName}`);
		}

		return await response.json();
	} else {
		const response = await fetch(`https://pokeapi.co/api/v2/move/`);
		if (!response.ok) {
			throw new Error(`Move not found: ${moveName}`);
		}

		return await response.json();
	}
};

const itemEndPoint = async (itemName: string) => {
	// Fetch item data from PokeAPI
	const response = await fetch(`https://pokeapi.co/api/v2/item/${itemName}`);

	if (!response.ok) {
		throw new Error(`Item not found: ${itemName}`);
	}

	return await response.json();
};

const abilityEndPoint = async (abilityName: string) => {
	// Fetch ability data from PokeAPI
	const response = await fetch(
		`https://pokeapi.co/api/v2/ability/${abilityName}`
	);
	if (!response.ok) {
		throw new Error(`Berry not found: ${abilityName}`);
	}

	return await response.json();
};

export {
	pokemonEndPoint,
	speciesEndPoint,
	moveEndPoint,
	abilityEndPoint,
	itemEndPoint,
};
