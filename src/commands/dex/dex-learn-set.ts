import {
	EmbedBuilder,
	SlashCommandBuilder,
	type SlashCommandSubcommandBuilder,
	type ChatInputCommandInteraction,
	MessageFlags,
} from 'discord.js';
import { extractPokemonInfo } from '~/api/dataExtraction/extractPokemonInfo';
import { pokemonEndPoint } from '~/api/endpoints';
import { formatUserInput } from '~/utility/formatting/formatUserInput';
import { matchPokemonSpecies } from '~/utility/fuzzy-search/pokemon';
import {
	buildCategoryJumpMenu,
	buildEmbedForMoves,
	buildNavigationButtons,
} from '~/components/handlers/learnSetUIBuilders';
import {
	formatMoveLine,
	groupAndSortMoves,
	processMoveData,
} from '~/components/handlers/learnSetDataProcessing';
import type {
	LearnMethodKey,
	GroupedMove,
	LearnMethodConfig,
} from '~/types/learnSetTypes';
// import { version_convert } from '~/utility/formatting/formatVersion';

/* ============================================================
 * Types & Config
 * ============================================================ */

export const learnMethodConfig: LearnMethodConfig = {
	'level-up': { label: 'Level Up', emoji: '📈', color: 0x57f287 },
	machine: { label: 'Machine', emoji: '💿', color: 0x5865f2 },
	tutor: { label: 'Tutor', emoji: '🎓', color: 0xeb459e },
	egg: { label: 'Breeding', emoji: '🥚', color: 0xfee75c },
	other: { label: 'Other', emoji: '⚡', color: 0x99aab5 },
};

const addPokemonAndFormOptions = (sub: SlashCommandSubcommandBuilder) =>
	sub
		.addStringOption((o) =>
			o
				.setName('pokemon')
				.setDescription('Enter the Pokémon name.')
				.setRequired(true),
		)
		.addStringOption((o) =>
			o
				.setName('form')
				.setDescription('Enter the form name.')
				.setRequired(false),
		);

/* ============================================================
 * Command
 * ============================================================ */

export default {
	data: new SlashCommandBuilder()
		.setName('dex-learn-set')
		.setDescription("View a Pokémon's learnable moves.")
		.addSubcommand((sub) =>
			addPokemonAndFormOptions(
				sub.setName('all').setDescription('View all learnable moves.'),
			),
		)
		.addSubcommand((sub) =>
			addPokemonAndFormOptions(
				sub.setName('level-up').setDescription('View level-up moves.'),
			),
		)
		.addSubcommand((sub) =>
			addPokemonAndFormOptions(
				sub.setName('machine').setDescription('View machine moves.'),
			),
		)
		.addSubcommand((sub) =>
			addPokemonAndFormOptions(
				sub.setName('tutor').setDescription('View tutor moves.'),
			),
		)
		.addSubcommand((sub) =>
			addPokemonAndFormOptions(
				sub.setName('egg').setDescription('View egg moves.'),
			),
		)
		.addSubcommand((sub) =>
			addPokemonAndFormOptions(
				sub.setName('other').setDescription('View other moves.'),
			),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const sub = interaction.options.getSubcommand();
		const pokemonInput = formatUserInput(
			interaction.options.getString('pokemon', true),
		);
		const form = interaction.options.getString('form') ?? '';

		await interaction.deferReply();

		try {
			const searchName = [pokemonInput, form].filter(Boolean).join('-');

			const { speciesName, formName } = await matchPokemonSpecies(searchName);
			const apiName = formName || speciesName;

			let rawData;

			try {
				rawData = await pokemonEndPoint(apiName || speciesName);
			} catch {
				rawData = await pokemonEndPoint(speciesName);
			}

			const pokemonData = extractPokemonInfo(rawData);

			const name = pokemonData.name.toUpperCase();
			const sprite = pokemonData.sprites.front_default;

			const moves = processMoveData(pokemonData);
			const groupedMoves = groupAndSortMoves(moves);

			// Filter by subcommand
			const methods = Object.keys(groupedMoves).filter(
				(m) => groupedMoves[m as LearnMethodKey].length > 0,
			) as LearnMethodKey[];

			if (methods.length === 0) {
				await interaction.editReply(
					`❌ No learnable moves were found for ${pokemonData.name}.`,
				);
				return;
			}

			let methodIndex = 0;
			let page = 0;
			const movesPerPage = 15;

			// For subcommands other than 'all', only show the relevant method
			if (sub !== 'all') {
				methodIndex = methods.findIndex((m) => m === sub);
				if (methodIndex === -1) {
					await interaction.editReply(`❌ No moves found for ${sub}.`);
					return;
				}
			}

			const formatMoveLineWithConfig = (
				move: GroupedMove,
				method: LearnMethodKey,
			) => formatMoveLine(move, method, learnMethodConfig);

			const generateEmbed = () =>
				buildEmbedForMoves(
					name,
					sprite,
					methods[methodIndex],
					groupedMoves[methods[methodIndex]],
					page,
					movesPerPage,
					learnMethodConfig,
					formatMoveLineWithConfig,
				);

			const buttonRow = buildNavigationButtons();
			const jumpRow =
				sub === 'all'
					? buildCategoryJumpMenu(methods, learnMethodConfig)
					: undefined;

			const components = jumpRow ? [buttonRow, jumpRow] : [buttonRow];

			const message = await interaction.editReply({
				embeds: [generateEmbed()],
				components,
			});

			const collector = message.createMessageComponentCollector({
				time: 60_000,
			});

			collector.on('collect', async (i) => {
				if (i.user.id !== interaction.user.id) {
					await i.reply({
						content: 'This interaction is not for you.',
						ephemeral: true,
					});
					return;
				}

				const currentMethod = methods[methodIndex];
				const totalPages = Math.ceil(
					groupedMoves[currentMethod].length / movesPerPage,
				);

				if (i.isButton()) {
					if (i.customId === 'prev') {
						if (page > 0) page--;
						else {
							// Loop to last page of previous method
							methodIndex = (methodIndex - 1 + methods.length) % methods.length;
							const newMethod = methods[methodIndex];
							page =
								Math.ceil(groupedMoves[newMethod].length / movesPerPage) - 1;
						}
					}

					if (i.customId === 'next') {
						if (page < totalPages - 1) page++;
						else {
							// Loop to first page of next method
							methodIndex = (methodIndex + 1) % methods.length;
							page = 0;
						}
					}
				} else if (i.isStringSelectMenu() && i.customId === 'jump_select') {
					methodIndex = parseInt(i.values[0]);
					page = 0;
				}

				const updatedComponents = jumpRow ? [buttonRow, jumpRow] : [buttonRow];

				await i.update({
					embeds: [generateEmbed()],
					components: updatedComponents,
				});

				collector.resetTimer();
			});

			collector.on('end', async () => {
				await interaction.editReply({
					components: [], // remove components when collector ends
				});
			});

			const iconLegend = new EmbedBuilder()
				.setColor(0x4ecdc4)
				.setTitle('Icon Legend').setDescription(`
					This move can also be learned by: \n\n
					Level Up - 📈\n
					Machine - 💿\n
					Tutor - 🎓\n
					Breeding - 🥚\n
					Other - ⚡`);

			await interaction.followUp({
				embeds: [iconLegend],
				flags: MessageFlags.Ephemeral,
			});
		} catch (err) {
			await interaction.editReply(
				`❌ Pokémon "${pokemonInput}" could not be found.\n\n${err}`,
			);
		}
	},
};
