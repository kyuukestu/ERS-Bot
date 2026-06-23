import {
	abilityEndPoint,
	itemEndPoint,
	moveEndPoint,
	pokemonEndPoint,
	speciesEndPoint,
	typeEndPoint,
} from '~/api/endpoints';

const wrapApiError = (resource: string, name: string, error: unknown) =>
	new Error(`${resource} not found: ${name}. ${error}`);

export const getPokemonByName = async (pokemonName: string) => {
	try {
		return await pokemonEndPoint(pokemonName);
	} catch (error) {
		throw wrapApiError('Pokemon', pokemonName, error);
	}
};

export const getSpeciesByName = async (speciesName: string) => {
	try {
		return await speciesEndPoint(speciesName);
	} catch (error) {
		throw wrapApiError('Species', speciesName, error);
	}
};

export const getItemByName = async (itemName: string) => {
	try {
		return await itemEndPoint(itemName);
	} catch (error) {
		throw wrapApiError('Item', itemName, error);
	}
};

export const getAbilityByName = async (abilityName: string) => {
	try {
		return await abilityEndPoint(abilityName);
	} catch (error) {
		throw wrapApiError('Ability', abilityName, error);
	}
};

export const getMoveByName = async (moveName: string) => {
	try {
		return await moveEndPoint(moveName);
	} catch (error) {
		throw wrapApiError('Move', moveName, error);
	}
};

export const getTypeByName = async (typeName: string) => {
	try {
		return await typeEndPoint(typeName);
	} catch (error) {
		throw wrapApiError('Type', typeName, error);
	}
};
