const { fetch } = require('node-fetch');

const pokemonEndPoint = async (pokemonName: string) => {
	// Format the move name (lowercase, replace spaces with hyphens, remove apostrophes)
	const formattedPokeName = pokemonName
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/'/g, '');

	// Fetch Pokémon data from PokeAPI
	const response = await fetch(
		`https://pokeapi.co/api/v2/pokemon/${formattedPokeName}`
	);
	if (!response.ok) {
		throw new Error(`Pokémon not found: ${formattedPokeName}`);
	}

	return await response.json();
};

const moveEndPoint = async (moveName: string) => {
	// Format the move name (lowercase, replace spaces with hyphens, remove apostrophes)
	const formattedMoveName = moveName
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/'/g, '');

	// Fetch moved data from PokeAPI
	const response = await fetch(
		`https://pokeapi.co/api/v2/move/${formattedMoveName}`
	);
	if (!response.ok) {
		throw new Error(`Move not found: ${formattedMoveName}`);
	}

	return await response.json();
};

const itemEndPoint = async (itemName: string) => {
	// Format the item name (lowercase, replace spaces with hyphens, remove apostrophes)
	const formattedItemName = itemName
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/'/g, '');

	// Fetch item data from PokeAPI
	const response = await fetch(
		`https://pokeapi.co/api/v2/item/${formattedItemName}`
	);

	if (!response.ok) {
		throw new Error(`Item not found: ${formattedItemName}`);
	}

	return await response.json();
};

const abilityEndPoint = async (abilityName: string) => {
	// Format the ability name (lowercase, replace spaces with hyphens, remove apostrophes)
	const formattedAbilityName = abilityName
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/'/g, '');

	// Fetch ability data from PokeAPI
	const response = await fetch(
		`https://pokeapi.co/api/v2/ability/${formattedAbilityName}`
	);
	if (!response.ok) {
		throw new Error(`Berry not found: ${formattedAbilityName}`);
	}

	return await response.json();
};

export { pokemonEndPoint, moveEndPoint, abilityEndPoint, itemEndPoint };
