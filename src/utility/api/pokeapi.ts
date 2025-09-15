import axios from 'axios';

const pokeApi = axios.create({
	baseURL: 'https://pokeapi.co/api/v2',
	timeout: 5000, // optional
});

export const pokemonEndPoint = async (pokemonName: string) => {
	try {
		const { data } = await pokeApi.get(`/pokemon/${pokemonName}`);
		return data;
	} catch (error) {
		throw new Error(`Pokemon not found: ${pokemonName} \n ${error}`);
	}
};

export const speciesEndPoint = async (speciesName: string) => {
	try {
		const { data } = await pokeApi.get(`/pokemon-species/${speciesName}`);
		return data;
	} catch (error) {
		throw new Error(`Species not found: ${speciesName} \n ${error}`);
	}
};

export const moveEndPoint = async (moveName?: string) => {
	try {
		const { data } = await pokeApi.get(`/move/${moveName}`);
		return data;
	} catch (error) {
		throw new Error(`Move not found: ${moveName} \n ${error}`);
	}
};

export const itemEndPoint = async (itemName: string) => {
	try {
		const { data } = await pokeApi.get(`/item/${itemName}`);
		return data;
	} catch (error) {
		throw new Error(`Item not found: ${itemName} \n ${error}`);
	}
};

export const abilityEndPoint = async (abilityName: string) => {
	try {
		const { data } = await pokeApi.get(`/ability/${abilityName}`);
		return data;
	} catch (error) {
		throw new Error(`Ability not found: ${abilityName} \n ${error}`);
	}
};
