const { pokemonEndPoint } = require('../../components/api/PokeApi.ts');
const {
	formatUserInput,
} = require('../../components/utility/formatUserInput.ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { PokemonData } from '../../components/interface/PokemonData.ts';

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
		const pokemonName = formatUserInput(
			interaction.options.get('pokemon', true).value as string
		);

		try {
			await interaction.deferReply();

			const data: PokemonData = await pokemonEndPoint(pokemonName);
			const name = data.name.toUpperCase();
			const sprite = data.sprites.front_default;
			const moves = processMoveData(data);

			// Group and sort moves
			const groupedMoves = groupAndSortMoves(moves);

			// Paginate moves
			const movesPerPage = 15;
			let currentPage = 0;

			const generateEmbed = (page: number) => {
				const start = page * movesPerPage;
				const end = start + movesPerPage;

				// Flatten grouped moves for pagination
				const allMoves = Object.entries(groupedMoves).flatMap(
					([method, moves]) => [`__**${method.toUpperCase()}**__`, ...moves]
				);

				const movesPage = allMoves.slice(start, end);

				return new EmbedBuilder()
					.setTitle(`📖 Moveset: ${name}`)
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

			// Rest of the interaction handling...
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

			// Button collector logic remains the same...
			const collector = message.createMessageComponentCollector({
				time: 30000,
			});

			collector.on('collect', async (buttonInteraction) => {
				if (buttonInteraction.customId === 'previous') currentPage--;
				if (buttonInteraction.customId === 'next') currentPage++;
				collector.resetTimer();

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
			console.error('Error:', error);
			const errorMsg = `❌ Error: Pokémon "${pokemonName}" not found.`;
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(errorMsg);
			} else {
				await interaction.reply(errorMsg);
			}
		}
	},
};

function processMoveData(data: PokemonData) {
	return data.moves.map((moveData) => {
		const moveName = moveData.move.name;
		const methods = moveData.version_group_details.map((detail) => ({
			method: detail.move_learn_method.name,
			level: detail.level_learned_at,
			version: detail.version_group.name,
		}));

		// Find the lowest level-up method if it exists
		const levelUpMethods = methods.filter((m) => m.method === 'level-up');
		const primaryMethod =
			levelUpMethods.length > 0
				? levelUpMethods.reduce(
						(prev, curr) => (curr.level < prev.level ? curr : prev),
						levelUpMethods[0]
				  )
				: methods[0]; // Fallback to first method if no level-up

		return {
			name: moveName,
			primaryMethod: primaryMethod.method,
			primaryLevel: primaryMethod.level,
			version: primaryMethod.version,
			allMethods: methods,
		};
	});
}
function formatMethodName(method: string): string {
	return method
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function formatMoveName(moveName: string): string {
	return moveName
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

function groupAndSortMoves(
	moves: {
		name: string;
		primaryMethod: string;
		primaryLevel: number;
		version: string;
		allMethods: { method: string; level: number }[];
	}[]
): { [key: string]: string[] } {
	const grouped: {
		[key: string]: Array<{
			name: string;
			level: number;
			otherMethods: string[];
			version: string;
		}>;
	} = {};

	// First group the moves by method (with formatted names)
	moves.forEach((move) => {
		const formattedMethod = formatMethodName(move.primaryMethod);
		if (!grouped[formattedMethod]) {
			grouped[formattedMethod] = [];
		}

		const formattedMoveName = formatMoveName(move.name);
		if (!grouped[move.primaryMethod]) {
			grouped[move.primaryMethod] = [];
		}

		const otherMethods = [
			...new Set(
				move.allMethods
					.filter((m) => m.method !== move.primaryMethod)
					.map((m) => formatMethodName(m.method))
			),
		];

		grouped[formattedMethod].push({
			name: formattedMoveName,
			level: move.primaryLevel,
			otherMethods: otherMethods,
			version: move.version,
		});
	});

	// Then sort each group appropriately
	const result: { [key: string]: string[] } = {};

	// Sort Level Up moves by level
	const levelUpKey = 'Level Up';
	if (grouped[levelUpKey]) {
		grouped[levelUpKey].sort((a, b) => a.level - b.level);
		result[levelUpKey] = grouped[levelUpKey].map((move) => {
			const levelDisplay = move.level > 0 ? ` (Lv. ${move.level})` : '';
			const otherMethodsDisplay =
				move.otherMethods.length > 0
					? ` | **Also by:** ${move.otherMethods.join(', ')}`
					: '';
			return `**${move.name}**:${levelDisplay}${otherMethodsDisplay} [${move.version}]`;
		});
	}

	// Sort other methods alphabetically
	const otherMethods = Object.keys(grouped).filter((m) => m !== levelUpKey);
	const sortedOtherMethods = otherMethods.toSorted((a, b) =>
		a.localeCompare(b)
	);
	sortedOtherMethods.forEach((method) => {
		grouped[method].sort((a, b) => a.name.localeCompare(b.name));
		result[method] = grouped[method].map((move) => {
			const otherMethodsDisplay =
				move.otherMethods.length > 0
					? ` • **Also by:** ${move.otherMethods.join(', ')}`
					: '';
			return `**${move.name}**:${otherMethodsDisplay} [${move.version}]`;
		});
	});

	return result;
}
