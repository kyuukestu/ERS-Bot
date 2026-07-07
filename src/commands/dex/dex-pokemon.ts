import {
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandBooleanOption,
	EmbedBuilder,
	ComponentType,
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	type ButtonInteraction,
} from 'discord.js';
import { formatUserInput } from '~/utility/formatting/formatUserInput.ts';
import { PokemonStatsCanvas } from '~/utility/statsCanvas.ts';
import type { PokemonStats } from '~/interface/canvasData';
import {
	buildBreedingCaptureBlocks,
	buildPokemonSprites,
	buildPokemonStats,
	buildTotalStats,
	fetchPokemonInfo,
	fetchPokemonSpeciesInfo,
	resolvePokemonSpecies,
} from '~/services/dex/pokemonService.ts';
import {
	buildPokemonEmbed,
	buildPokemonMatchSummary,
	buildPokemonViewActionRow,
	handlePokedexEntries,
} from '~/services/dex/pokemonUiService.ts';
import { handleSpriteGallery } from '~/components/handleSpriteGallery';
import { pokemonSearchService } from '~/services/dex/pokemonSearchService';

export default {
	data: new SlashCommandBuilder()
		.setName('dex-pokemon')
		.setDescription('Provides pokedex-like information about a Pokémon.')
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('name')
				.setDescription('Enter the Pokémon name.')
				.setAutocomplete(true)
				.setRequired(true),
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('form')
				.setDescription(`Enter the pokémon's form (e.g., alolan, galar).`)
				.setRequired(false),
		)
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('shiny')
				.setDescription('Show shiny variant by default.')
				.setRequired(false),
		),

	async autocomplete(interaction: AutocompleteInteraction) {
		const query = interaction.options.getFocused();

		// console.log('Autocomplete Query:', query);

		const results = pokemonSearchService.search(query);

		await interaction.respond(
			results.map((pokemon) => ({
				name: pokemon.name,
				value: pokemon.name,
			})),
		);
	},
	async execute(interaction: ChatInputCommandInteraction) {
		const pokemonName = formatUserInput(
			interaction.options.getString('name', true),
		);

		const form = interaction.options.getString('form')
			? formatUserInput(interaction.options.getString('form')!)
			: '';

		const showShiny = interaction.options.getBoolean('shiny') || false;
		const searchName = formatUserInput(`${pokemonName} ${form}`);

		try {
			await interaction.deferReply();

			const { speciesName, formName, firstMatch, otherMatches } =
				await resolvePokemonSpecies(`${pokemonName} ${form}`);

			console.log(
				`First Match: ${firstMatch}; Matched Name: ${speciesName}; Matched Form: ${formName}; Other Matches: ${JSON.stringify(otherMatches)}`,
			);

			const pokemonInfo = await fetchPokemonInfo(firstMatch);
			const speciesInfo = await fetchPokemonSpeciesInfo(speciesName);

			// TODO: Implement check for cases in which the pokemon endpoint passes but the species end-point does not.

			const { breedingFormatted, captureFormatted } =
				buildBreedingCaptureBlocks(speciesInfo);

			const sprites = buildPokemonSprites(pokemonInfo, showShiny);
			const stats: PokemonStats = buildPokemonStats(pokemonInfo);

			// Create stats visualization
			const statsImage = PokemonStatsCanvas.createStatsImage(stats, {
				backgroundColor: '#36393F',
				borderColor: '#72767D',
				width: 500,
				height: 280,
			});

			// Calculate total stats
			const totalStats = buildTotalStats(stats);

			const matchSummary = buildPokemonMatchSummary(firstMatch, otherMatches);

			const mainEmbed = buildPokemonEmbed(
				pokemonInfo,
				speciesInfo,
				breedingFormatted,
				captureFormatted,
				sprites,
				totalStats,
				showShiny,
				interaction.user.username,
				interaction.user.displayAvatarURL(),
				matchSummary,
			);

			const hasSpriteGallery = Object.values(sprites).some(Boolean);
			const actionRow = buildPokemonViewActionRow(hasSpriteGallery);

			await interaction.editReply({
				embeds: [mainEmbed],
				components: [actionRow.toJSON()],
				files: [statsImage],
			});

			const collector = interaction.channel?.createMessageComponentCollector({
				filter: (i) => i.user.id === interaction.user.id,
				time: 300000, // 5 minutes
				componentType: ComponentType.Button,
			});

			collector?.on('collect', async (buttonInteraction: ButtonInteraction) => {
				switch (buttonInteraction.customId) {
					case 'pokedex_entries':
						await handlePokedexEntries(
							buttonInteraction,
							speciesInfo,
							pokemonInfo.name,
						);
						break;
					case 'sprite_gallery':
						await handleSpriteGallery(
							buttonInteraction,
							sprites,
							pokemonInfo.name,
							showShiny,
						);
						break;
				}
			});

			collector?.on('end', () => {
				interaction.editReply({ components: [] }).catch(console.error);
			});
		} catch (error) {
			console.error('Error fetching Pokemon data:', error);

			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('❌ Pokémon Not Found')
				.setDescription(
					`Could not find a Pokémon named "${searchName}". Please check the spelling and try again.`,
				)
				.addFields({
					name: '💡 Tips',
					value:
						'• Try using the exact Pokémon name\n• For forms, use: `Pikachu` with form: `Alola`\n• Check for typos in the name',
				});

			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({ embeds: [errorEmbed] });
			} else {
				await interaction.reply({ embeds: [errorEmbed] });
			}
		}
	},
};
