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
		.setName('moveset')
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
			}

			const data: PokemonData = await response.json();

			// Extract Pokémon details
			const name = data.name.toUpperCase();
			const sprite = data.sprites.front_default;

			// Process moves to include only the version with the lowest learn level (prefer level-up)
			const moves = data.moves.map((m) => {
				// Filter for level-up methods
				const levelUpEntries = m.version_group_details.filter(
					(d) => d.move_learn_method.name === 'level-up'
				);

				// If level-up methods exist, find the one with the lowest level
				let lowestLevelEntry;
				if (levelUpEntries.length > 0) {
					lowestLevelEntry = levelUpEntries.reduce(
						(prev, curr) =>
							curr.level_learned_at < prev.level_learned_at ? curr : prev,
						levelUpEntries[0]
					);
				} else {
					// If no level-up methods exist, fall back to the lowest level from other methods
					lowestLevelEntry = m.version_group_details.reduce(
						(prev, curr) =>
							curr.level_learned_at < prev.level_learned_at ? curr : prev,
						m.version_group_details[0]
					);
				}

				return {
					name: m.move.name,
					level: lowestLevelEntry.level_learned_at,
					method: lowestLevelEntry.move_learn_method.name,
					version: lowestLevelEntry.version_group.name,
				};
			});

			// Sort moves in ascending order by level (moves with level 0 go to the end)
			moves.sort((a, b) => {
				if (a.level === 0) return 1; // Move level 0 to the end
				if (b.level === 0) return -1; // Keep non-zero levels at the front
				return a.level - b.level; // Sort by level in ascending order
			});

			// Group moves by learn method
			const groupedMoves: { [key: string]: string[] } = {};
			for (const move of moves) {
				if (!groupedMoves[move.method]) {
					groupedMoves[move.method] = [];
				}
				groupedMoves[move.method].push(
					`**${move.name}**: Level ${move.level} [${move.version}]`
				);
			}

			// Paginate moves
			const movesPerPage = 10;
			let currentPage = 0;

			// Function to generate the embed for the current page
			const generateEmbed = (page: number) => {
				const start = page * movesPerPage;
				const end = start + movesPerPage;

				// Flatten the grouped moves into a single array for pagination
				const allMoves = Object.entries(groupedMoves).flatMap(
					([method, moves]) => [`__**${method.toUpperCase()}**__`, ...moves]
				);

				const movesPage = allMoves.slice(start, end);

				return new EmbedBuilder()
					.setTitle(`📖 Pokédex Entry: ${name}`)
					.setThumbnail(sprite)
					.addFields({
						name: 'Moves',
						value: movesPage.join('\n') || 'No moves found.',
					})
					.setFooter({
						text: `Page ${page + 1}/${Math.ceil(
							allMoves.length / movesPerPage
						)}`,
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
								currentPage >=
									Math.ceil(
										Object.values(groupedMoves).flat().length / movesPerPage
									) -
										1
							)
					),
				],
			});

			// Handle button interactions
			const collector = message.createMessageComponentCollector({
				time: 30000, // 30 seconds
			});

			collector.on('collect', async (buttonInteraction) => {
				if (buttonInteraction.customId === 'previous') {
					currentPage--;
					collector.resetTimer();
				} else if (buttonInteraction.customId === 'next') {
					currentPage++;
					collector.resetTimer();
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
									currentPage >=
										Math.ceil(
											Object.values(groupedMoves).flat().length / movesPerPage
										) -
											1
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
