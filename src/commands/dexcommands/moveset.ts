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
	StringSelectMenuBuilder,
} = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { PokemonData } from '../../components/interface/pokemonData.ts';

// ADD THIS: Enhanced styling configuration
const methodConfig = {
	'Level Up': { emoji: '📈', color: 0x57f287 },
	Machine: { emoji: '💿', color: 0x5865f2 },
	Tutor: { emoji: '🎓', color: 0xeb459e },
	Breeding: { emoji: '🥚', color: 0xfee75c },
	Other: { emoji: '⚡', color: 0x99aab5 },
};

function getMethodConfig(method: string) {
	const normalizedMethod = method.toLowerCase();
	if (normalizedMethod.includes('level')) return methodConfig['Level Up'];
	if (
		normalizedMethod.includes('machine') ||
		normalizedMethod.includes('tm') ||
		normalizedMethod.includes('tr')
	)
		return methodConfig['Machine'];
	if (normalizedMethod.includes('tutor')) return methodConfig['Tutor'];
	if (normalizedMethod.includes('breed') || normalizedMethod.includes('egg'))
		return methodConfig['Breeding'];
	return methodConfig['Other'];
}

function createLevelProgressBar(level: number, maxLevel: number = 100): string {
	const progress = Math.min(level / maxLevel, 1);
	const filledBlocks = Math.floor(progress * 10);
	const emptyBlocks = 10 - filledBlocks;
	return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
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
		const pokemonName = formatUserInput(
			interaction.options.get('pokemon', true).value as string
		);

		try {
			await interaction.deferReply();

			const data: PokemonData = await pokemonEndPoint(pokemonName);
			const name = data.name.toUpperCase();
			const sprite = data.sprites.front_default;
			const moves = processMoveData(data);

			// MODIFIED: Use enhanced grouping
			const groupedMoves = groupAndSortMovesEnhanced(moves);
			const methods = Object.keys(groupedMoves);

			// MODIFIED: Track both method and page within method
			let currentMethodIndex = 0;
			let currentPageInMethod = 0;
			const movesPerPage = 15;

			// REPLACED: Enhanced embed generation with proper pagination
			const generateEmbed = (methodIndex: number, pageInMethod: number) => {
				const currentMethod = methods[methodIndex];
				const methodMoves = groupedMoves[currentMethod];
				const config = getMethodConfig(currentMethod);

				// Calculate pagination within the current method
				const totalPagesInMethod = Math.ceil(methodMoves.length / movesPerPage);
				const startIndex = pageInMethod * movesPerPage;
				const endIndex = startIndex + movesPerPage;
				const currentMoves = methodMoves.slice(startIndex, endIndex);

				const embed = new EmbedBuilder()
					.setTitle(
						`📖 ${name} • ${config.emoji} ${currentMethod.toUpperCase()}`
					)
					.setThumbnail(sprite)
					.setColor(config.color)
					.addFields({
						name: `${config.emoji} ${currentMethod} Moves (${methodMoves.length})`,
						value:
							currentMoves
								.map((move) => formatEnhancedMove(move, currentMethod))
								.join('\n') || 'No moves found.',
					});

				// Enhanced footer with both method and page info
				let footerText = `Method ${methodIndex + 1}/${methods.length}`;
				if (totalPagesInMethod > 1) {
					footerText += ` • Page ${
						pageInMethod + 1
					}/${totalPagesInMethod} in ${currentMethod}`;
				}
				embed.setFooter({ text: footerText });

				// Add stats field for level-up moves
				if (currentMethod === 'Level Up') {
					const levels = methodMoves.map((m) => m.level).filter((l) => l > 0);
					if (levels.length > 0) {
						const minLevel = Math.min(...levels);
						const maxLevel = Math.max(...levels);
						embed.addFields({
							name: '📊 Level Range',
							value: `First Move: Lv.${minLevel} • Last Move: Lv.${maxLevel}`,
							inline: true,
						});
					}
				}

				return embed;
			};

			// REPLACED: Enhanced button creation with proper navigation logic
			const createButtons = (methodIndex: number, pageInMethod: number) => {
				const currentMethod = methods[methodIndex];
				const methodMoves = groupedMoves[currentMethod];
				const config = getMethodConfig(currentMethod);
				const totalPagesInMethod = Math.ceil(methodMoves.length / movesPerPage);

				// Determine what previous/next should do
				const canGoPreviousPage = pageInMethod > 0;
				const canGoNextPage = pageInMethod < totalPagesInMethod - 1;
				const canGoPreviousMethod = methodIndex > 0;
				const canGoNextMethod = methodIndex < methods.length - 1;

				const canGoPrevious = canGoPreviousPage || canGoPreviousMethod;
				const canGoNext = canGoNextPage || canGoNextMethod;

				// Create navigation label based on what will happen
				let previousLabel = '◀ Previous';
				let nextLabel = 'Next ▶';

				if (canGoPreviousPage) {
					previousLabel = `◀ Page ${pageInMethod}`;
				} else if (canGoPreviousMethod) {
					previousLabel = `◀ ${formatMethodName(methods[methodIndex - 1])}`;
				}

				if (canGoNextPage) {
					nextLabel = `Page ${pageInMethod + 2} ▶`;
				} else if (canGoNextMethod) {
					nextLabel = `${formatMethodName(methods[methodIndex + 1])} ▶`;
				}

				return new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('previous')
						.setLabel(previousLabel)
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(!canGoPrevious),
					new ButtonBuilder()
						.setCustomId('method_info')
						.setLabel(
							`${config.emoji} ${currentMethod}${
								totalPagesInMethod > 1
									? ` (${pageInMethod + 1}/${totalPagesInMethod})`
									: ''
							}`
						)
						.setStyle(ButtonStyle.Success)
						.setDisabled(true), // Just for display
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel(nextLabel)
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(!canGoNext),
					new ButtonBuilder()
						.setCustomId('jump_menu')
						.setLabel('📋 Jump To')
						.setStyle(ButtonStyle.Primary)
				);
			};

			// ADD THIS: Jump menu creation
			const createJumpMenu = () => {
				const options = methods.map((method, index) => {
					const config = getMethodConfig(method);
					return {
						label: `${config.emoji} ${method}`,
						value: index.toString(),
						description: `View ${method.toLowerCase()} moves`,
					};
				});

				return new ActionRowBuilder().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('jump_select')
						.setPlaceholder('🔍 Jump to a specific move category')
						.addOptions(options)
				);
			};

			const message = await interaction.editReply({
				embeds: [generateEmbed(currentMethodIndex, currentPageInMethod)],
				components: [createButtons(currentMethodIndex, currentPageInMethod)],
			});

			// MODIFIED: Enhanced collector logic with proper pagination
			const collector = message.createMessageComponentCollector({
				time: 60000, // Increased timeout for better UX
			});

			collector.on('collect', async (buttonInteraction) => {
				if (buttonInteraction.isButton()) {
					if (buttonInteraction.customId === 'previous') {
						const currentMethod = methods[currentMethodIndex];
						const methodMoves = groupedMoves[currentMethod];
						const totalPagesInMethod = Math.ceil(
							methodMoves.length / movesPerPage
						);

						if (currentPageInMethod > 0) {
							// Go to previous page within current method
							currentPageInMethod--;
						} else if (currentMethodIndex > 0) {
							// Go to last page of previous method
							currentMethodIndex--;
							const newMethod = methods[currentMethodIndex];
							const newMethodMoves = groupedMoves[newMethod];
							const newTotalPages = Math.ceil(
								newMethodMoves.length / movesPerPage
							);
							currentPageInMethod = newTotalPages - 1;
						}
					}

					if (buttonInteraction.customId === 'next') {
						const currentMethod = methods[currentMethodIndex];
						const methodMoves = groupedMoves[currentMethod];
						const totalPagesInMethod = Math.ceil(
							methodMoves.length / movesPerPage
						);

						if (currentPageInMethod < totalPagesInMethod - 1) {
							// Go to next page within current method
							currentPageInMethod++;
						} else if (currentMethodIndex < methods.length - 1) {
							// Go to first page of next method
							currentMethodIndex++;
							currentPageInMethod = 0;
						}
					}

					if (buttonInteraction.customId === 'jump_menu') {
						await buttonInteraction.update({
							embeds: [generateEmbed(currentMethodIndex, currentPageInMethod)],
							components: [
								createButtons(currentMethodIndex, currentPageInMethod),
								createJumpMenu(),
							],
						});
						return;
					}
				} else if (
					buttonInteraction.isStringSelectMenu() &&
					buttonInteraction.customId === 'jump_select'
				) {
					currentMethodIndex = parseInt(buttonInteraction.values[0]);
					currentPageInMethod = 0; // Reset to first page of selected method
				}

				collector.resetTimer();

				await buttonInteraction.update({
					embeds: [generateEmbed(currentMethodIndex, currentPageInMethod)],
					components: [createButtons(currentMethodIndex, currentPageInMethod)],
				});
			});

			collector.on('end', () => {
				interaction.editReply({
					components: [
						new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setCustomId('previous')
								.setLabel('◀ Previous')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(true),
							new ButtonBuilder()
								.setCustomId('next')
								.setLabel('Next ▶')
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(true),
							new ButtonBuilder()
								.setCustomId('jump_menu')
								.setLabel('📋 Expired')
								.setStyle(ButtonStyle.Danger)
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

// KEEP EXISTING: processMoveData function
function processMoveData(data: PokemonData) {
	return data.moves.map((moveData) => {
		const moveName = moveData.move.name;
		const methods = moveData.version_group_details.map((detail) => ({
			method: detail.move_learn_method.name,
			level: detail.level_learned_at,
			version: detail.version_group.name,
		}));

		const levelUpMethods = methods.filter((m) => m.method === 'level-up');
		const primaryMethod =
			levelUpMethods.length > 0
				? levelUpMethods.reduce(
						(prev, curr) => (curr.level < prev.level ? curr : prev),
						levelUpMethods[0]
				  )
				: methods[0];

		return {
			name: moveName,
			primaryMethod: primaryMethod.method,
			primaryLevel: primaryMethod.level,
			version: primaryMethod.version,
			allMethods: methods,
		};
	});
}

// KEEP EXISTING: Helper functions
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

// REPLACED: Enhanced grouping function
function groupAndSortMovesEnhanced(moves: any[]): { [key: string]: any[] } {
	const grouped: { [key: string]: any[] } = {};

	moves.forEach((move) => {
		const formattedMethod = formatMethodName(move.primaryMethod);
		if (!grouped[formattedMethod]) {
			grouped[formattedMethod] = [];
		}

		const otherMethods = [
			...new Set(
				move.allMethods
					.filter((m: any) => m.method !== move.primaryMethod)
					.map((m: any) => formatMethodName(m.method))
			),
		];

		grouped[formattedMethod].push({
			name: formatMoveName(move.name),
			level: move.primaryLevel,
			version: move.version,
			method: formattedMethod,
			otherMethods: otherMethods,
		});
	});

	// Sort level-up moves by level, others alphabetically
	Object.keys(grouped).forEach((method) => {
		if (method === 'Level Up') {
			grouped[method].sort((a, b) => a.level - b.level);
		} else {
			grouped[method].sort((a, b) => a.name.localeCompare(b.name));
		}
	});

	return grouped;
}

// ADD THIS: Enhanced move formatting
function formatEnhancedMove(move: any, method: string): string {
	const config = getMethodConfig(method);

	if (method === 'Level Up') {
		if (move.level > 0) {
			const progressBar = createLevelProgressBar(move.level);
			return `${config.emoji} **${move.name}** ${progressBar} Lv.${move.level}`;
		} else {
			return `${config.emoji} **${move.name}** ░░░░░░░░░░ Start`;
		}
	} else {
		const otherMethodsDisplay =
			move.otherMethods && move.otherMethods.length > 0
				? ` • **Also by:** ${move.otherMethods.join(', ')}`
				: '';
		return `${config.emoji} **${move.name}**${otherMethodsDisplay} [${move.version}]`;
	}
}
