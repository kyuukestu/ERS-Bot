import { extractSpeciesInfo } from '~/api/dataExtraction/extractSpeciesInfo';
import { extractPokemonInfo } from '~/api/dataExtraction/extractPokemonInfo';
import { speciesEndPoint, pokemonEndPoint } from '~/api/endpoints';
import { renderSpeciesCardCanvas } from '~/components/canvas-dex/draw-dex-entry';
import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('pokedex')
		.setDescription('Show Pokémon info')
		.addStringOption((o) =>
			o.setName('pokemon').setDescription('Pokémon name').setRequired(true)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();

		const pokemonName = interaction.options.getString('pokemon', true);

		const rawSpeciesData = await speciesEndPoint(pokemonName);
		const rawPokemonData = await pokemonEndPoint(pokemonName);

		const speciesInfo = extractSpeciesInfo(rawSpeciesData);
		const pokemonInfo = extractPokemonInfo(rawPokemonData);

		const image = await renderSpeciesCardCanvas(speciesInfo, pokemonInfo);

		await interaction.editReply({
			files: [{ attachment: image, name: `${pokemonName}.png` }],
		});
	},
};
