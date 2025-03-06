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

export { pokemonEndPoint, moveEndPoint };
