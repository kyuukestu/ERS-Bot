const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
import type { CommandInteraction } from 'discord.js';
const { fetch } = require('node-fetch');

// Define the structure of the Pokémon data
interface PokemonData {
	name: string;
	sprites: { front_default: string };
	moves: {
		move: { name: string };
		version_group_details: {
			level_learned_at: number;
			move_learn_method: { name: string };
			version_group: { name: string };
		}[];
	}[];
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setdex')
		.setDescription('Get information about a Pokémon and their moves.')
		.addStringOption((option: any) =>
			option
				.setName('pokemon')
				.setDescription('Enter the Pokémon name.')
				.setRequired(true)
		),

	async execute(interaction: CommandInteraction) {
		const pokemonName = interaction.options.get('pokemon', true)
			.value as string;

		try {
			// Defer the reply to avoid interaction timeouts
			await interaction.deferReply();

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
			} else {
				await interaction.editReply(
					`🔍 Searching for Pokémon: ${formattedPokeName}`
				);
			}

			const data: PokemonData = (await response.json()) as PokemonData;

			await interaction.followUp(
				` "${formattedPokeName}" data being gathered. `
			);

			// Extract Pokémon details
			const name = data.name.toUpperCase();
			const sprite = data.sprites.front_default;

			const moves = data.moves.map((m) => {
				// Find the version with the lowest learn level
				const lowestLevelEntry = m.version_group_details.reduce(
					(prev, curr) =>
						curr.level_learned_at < prev.level_learned_at ? curr : prev,
					m.version_group_details[0]
				);

				return {
					name: m.move.name,
					level: lowestLevelEntry.level_learned_at,
					method: lowestLevelEntry.move_learn_method.name,
					version: lowestLevelEntry.version_group.name,
				};
			});

			// Paginate moves
			const movesPerPage = 10;
			let currentPage = 0;

			await interaction.followUp(
				` "${formattedPokeName}" pages being generated. `
			);

			// Function to generate the embed for the current page
			const generateEmbed = (page: number) => {
				const start = page * movesPerPage;
				const end = start + movesPerPage;
				const movesPage = moves.slice(start, end);

				const movesText = movesPage
					.map((move) => {
						return `**${move.name}**: Level ${move.level} (${move.method}) [${move.version}]`;
					})
					.join('\n');

				return new EmbedBuilder()
					.setTitle(`📖 Pokédex Entry: ${name}`)
					.setThumbnail(sprite)
					.addFields({ name: 'Moves', value: movesText || 'No moves found.' })
					.setFooter({
						text: `Page ${page + 1}/${Math.ceil(moves.length / movesPerPage)}`,
					});
			};

			// Send the initial message with navigation buttons
			const message = await interaction.editReply({
				embeds: [generateEmbed(currentPage)],
				components: [
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('previous')
							.setLabel('Previous')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(currentPage === 0),
						new ButtonBuilder()
							.setCustomId('next')
							.setLabel('Next')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(
								currentPage >= Math.ceil(moves.length / movesPerPage) - 1
							)
					),
				],
			});

			// Handle button interactions
			const collector = message.createMessageComponentCollector({
				time: 60000, // 1 minute
			});

			collector.on('collect', async (buttonInteraction) => {
				if (buttonInteraction.customId === 'previous') {
					currentPage--;
				} else if (buttonInteraction.customId === 'next') {
					currentPage++;
				}

				// Update the message with the new page
				await buttonInteraction.update({
					embeds: [generateEmbed(currentPage)],
					components: [
						new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setCustomId('previous')
								.setLabel('Previous')
								.setStyle(ButtonStyle.Primary)
								.setDisabled(currentPage === 0),
							new ButtonBuilder()
								.setCustomId('next')
								.setLabel('Next')
								.setStyle(ButtonStyle.Primary)
								.setDisabled(
									currentPage >= Math.ceil(moves.length / movesPerPage) - 1
								)
						),
					],
				});
			});

			collector.on('end', () => {
				// Disable buttons after the collector ends
				interaction.editReply({
					components: [
						new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setCustomId('previous')
								.setLabel('Previous')
								.setStyle(ButtonStyle.Primary)
								.setDisabled(true),
							new ButtonBuilder()
								.setCustomId('next')
								.setLabel('Next')
								.setStyle(ButtonStyle.Primary)
								.setDisabled(true)
						),
					],
				});
			});
		} catch (error) {
			console.error('Error fetching Pokémon data:', error);

			await interaction.followUp(` Error fetching Pokémon data: `);

			// Check if the interaction has already been acknowledged
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(
					`❌ Error: Pokémon "${pokemonName}" not found. Please check the name and try again.`
				);
			} else {
				await interaction.reply(
					`❌ Error: Pokémon "${pokemonName}" not found. Please check the name and try again.`
				);
			}
		}
	},
};
