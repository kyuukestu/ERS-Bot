import { formatUserInput } from '~/utility/formatting/formatUserInput.ts';
import { matchPokemonSpecies } from '~/utility/fuzzy-search/pokemon.ts';
import { extractPokemonInfo } from '~/api/dataExtraction/extractPokemonInfo.ts';
import { extractSpeciesInfo } from '~/api/dataExtraction/extractSpeciesInfo.ts';
import {
	getPokemonByName,
	getSpeciesByName,
} from '~/services/dex/pokeapiService.ts';
import type { PokemonStats } from '~/interface/canvasData.ts';

export type PokemonInfo = ReturnType<typeof extractPokemonInfo>;
export type SpeciesInfo = ReturnType<typeof extractSpeciesInfo>;

export interface PokemonMatchResult {
	speciesName: string;
	formName?: string;
	firstMatch: string;
	otherMatches: Array<{ speciesName?: string }>;
}

export interface PokemonSprites {
	default: string | null;
	shiny: string | null;
	back: string | null;
	backShiny: string | null;
	officialArtwork: string | null;
	shinyArtwork: string | null;
	dreamWorld: string | null;
}

export const resolvePokemonSpecies = async (
	userInput: string,
): Promise<PokemonMatchResult> => {
	return matchPokemonSpecies(formatUserInput(userInput));
};

export const fetchPokemonInfo = async (
	lookup: string,
): Promise<PokemonInfo> => {
	const rawData = await getPokemonByName(lookup);
	return extractPokemonInfo(rawData);
};

export const fetchPokemonSpeciesInfo = async (
	speciesName: string,
): Promise<SpeciesInfo> => {
	const rawData = await getSpeciesByName(speciesName);
	return extractSpeciesInfo(rawData);
};

export const buildPokemonSprites = (
	pokemonInfo: PokemonInfo,
	showShiny: boolean,
): PokemonSprites => ({
	default: showShiny
		? pokemonInfo.sprites.front_shiny
		: pokemonInfo.sprites.front_default,
	shiny: pokemonInfo.sprites.front_shiny,
	back: showShiny
		? pokemonInfo.sprites.back_shiny
		: pokemonInfo.sprites.back_default,
	backShiny: pokemonInfo.sprites.back_shiny,
	officialArtwork:
		pokemonInfo.sprites.other['official-artwork']?.front_default ?? null,
	shinyArtwork:
		pokemonInfo.sprites.other['official-artwork']?.front_shiny ?? null,
	dreamWorld: pokemonInfo.sprites.other.dream_world?.front_default ?? null,
});

export const buildPokemonStats = (pokemonInfo: PokemonInfo): PokemonStats => ({
	hp: pokemonInfo.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0,
	attack:
		pokemonInfo.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0,
	defense:
		pokemonInfo.stats.find((s) => s.stat.name === 'defense')?.base_stat || 0,
	spAttack:
		pokemonInfo.stats.find((s) => s.stat.name === 'special-attack')
			?.base_stat || 0,
	spDefense:
		pokemonInfo.stats.find((s) => s.stat.name === 'special-defense')
			?.base_stat || 0,
	speed: pokemonInfo.stats.find((s) => s.stat.name === 'speed')?.base_stat || 0,
});

export const buildTotalStats = (stats: PokemonStats) =>
	Object.values(stats).reduce((sum, stat) => sum + stat, 0);

export const buildBreedingCaptureBlocks = (speciesInfo: SpeciesInfo) => {
	const maxLabelLength = Math.max(
		'Egg Groups:'.length,
		'Growth Rate:'.length,
		'Capture Rate:'.length,
		'Habitat:'.length,
	);

	return {
		breedingFormatted: [
			`**${'Egg Groups:'.padEnd(maxLabelLength, ' ')}** ${
				speciesInfo.egg_groups
			}`,
			`**${'Growth Rate:'.padEnd(maxLabelLength, ' ')}** ${
				speciesInfo.growth_rate
			}`,
		].join('\n'),
		captureFormatted: [
			`**${'Capture Rate:'.padEnd(maxLabelLength, ' ')}** ${
				speciesInfo.capture_rate
			}/255 (${speciesInfo.capture_percentage}%)`,
			`**${'Habitat:'.padEnd(maxLabelLength, ' ')}** ${speciesInfo.habitat}`,
		].join('\n'),
	};
};

export const getPrimaryType = (pokemonInfo: PokemonInfo) =>
	pokemonInfo.types[0] ?? 'normal';
