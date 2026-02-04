import {
	SlashCommandBuilder,
	type SlashCommandStringOption,
	type SlashCommandIntegerOption,
	EmbedBuilder,
	MessageFlags,
	type ChatInputCommandInteraction,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ComponentType,
} from 'discord.js';
import { moveEndPoint } from '~/api/endpoints';
import { formatUserInput } from '~/utility/formatting/formatUserInput.ts';
import { extractMoveInfo } from '~/api/dataExtraction/extractMoveInfo.ts';
import { createAttackEmbed } from '~/components/embeds/createAttackEmbed';
import { movePaginatedList } from '~/components/pagination/movePagination';
import { matchMoveName } from '~/utility/fuzzy-search/moves.ts';
import { typeChoices } from '~/database/typeChoices.ts';
import movesList from '~/../public/json/moves-list.json';
import pokemonList from '~/../public/json/pokemon-list.json';
import moveLearnList from '~/../public/json/moves-learn-list.json';

async function sendPaginatedMoveEmbed({
	interaction,
	moves,
	activeFilters = {},
	pageSize = 10,
}) {
	if (!moves.length) {
		return interaction.editReply({
			content: 'No moves matched your filters.',
			ephemeral: true,
		});
	}

	const filterLabels = {
		type: 'Type',
		minPower: 'Min Power',
		maxPower: 'Max Power',
		minAcc: 'Min Accuracy',
		maxAcc: 'Max Accuracy',
		priority: 'Priority',
		category: 'Category',
	};

	const filterText =
		Object.keys(activeFilters).length > 0
			? Object.entries(activeFilters)
					.map(([k, v]) => `${filterLabels[k]}: ${v}`)
					.join(' • ')
			: 'No filters applied';

	const pages = [];
	for (let i = 0; i < moves.length; i += pageSize) {
		pages.push(moves.slice(i, i + pageSize));
	}

	const renderPage = (pageIndex) => {
		const page = pages[pageIndex];

		return new EmbedBuilder()
			.setTitle('Move Search Results')
			.setDescription(
				page
					.map(
						(move) =>
							`**${move.name}** — ${move.type} ${move.category}` +
							` | Pow: ${move.power ?? '—'} | Acc: ${move.accuracy ?? '—'}`,
					)
					.join('\n'),
			)
			.setFooter({
				text: `Page ${pageIndex + 1}/${pages.length} • ${filterText}`,
			});
	};

	const buttons = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('prev')
			.setLabel('Prev')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('next')
			.setLabel('Next')
			.setStyle(ButtonStyle.Secondary),
	);

	let pageIndex = 0;

	const message = await interaction.editReply({
		embeds: [renderPage(0)],
		components: pages.length > 1 ? [buttons] : [],
		fetchReply: true,
	});

	if (pages.length === 1) return;

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 60_000,
	});

	collector.on('collect', async (i) => {
		if (i.customId === 'prev') {
			pageIndex = Math.max(0, pageIndex - 1);
		} else if (i.customId === 'next') {
			pageIndex = Math.min(pages.length - 1, pageIndex + 1);
		}

		await i.update({
			embeds: [renderPage(pageIndex)],
			components: [buttons],
		});

		collector.resetTimer();
	});

	collector.on('end', async () => {
		buttons.components.forEach((btn) => {
			if (btn instanceof ButtonBuilder) {
				btn.setDisabled(true);
			}
		});
		await message.edit({ components: [buttons] });
	});
}

async function sendPaginatedPokemonEmbed({ interaction, matches }) {
	// ----- config -----
	const PAGE_SIZE = 10;

	// ----- paginate helper -----
	function paginate<T>(items: T[], pageSize: number): T[][] {
		const pages: T[][] = [];
		for (let i = 0; i < items.length; i += pageSize) {
			pages.push(items.slice(i, i + pageSize));
		}
		return pages;
	}

	// ----- main logic -----
	if (matches.length === 0) {
		await interaction.editReply('No Pokémon match that criteria.');
		return;
	}

	const pages = paginate(matches, PAGE_SIZE);
	let currentPage = 0;

	// ----- embed builder -----
	function buildEmbed(page: number) {
		const pageData = pages[page];

		return new EmbedBuilder()
			.setTitle(`Matching Pokémon (${page + 1}/${pages.length})`)
			.setDescription(
				pageData
					.map((p) => `• **${p.name}** (${p.types.join(', ')})`)
					.join('\n'),
			);
	}

	// ----- button row builder -----
	function buildRow(page: number) {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('prev')
				.setLabel('Prev')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 0),

			new ButtonBuilder()
				.setCustomId('next')
				.setLabel('Next')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === pages.length - 1),
		);
	}

	// ----- send initial message -----
	const message = await interaction.editReply({
		embeds: [buildEmbed(currentPage)],
		components: pages.length > 1 ? [buildRow(currentPage)] : [],
		fetchReply: true,
	});

	// ----- interaction collector -----
	const collector = message.createMessageComponentCollector({
		time: 60_000,
	});

	collector.on('collect', (i) => {
		if (i.customId === 'prev') currentPage--;
		if (i.customId === 'next') currentPage++;

		i.update({
			embeds: [buildEmbed(currentPage)],
			components: [buildRow(currentPage)],
		});
	});

	collector.on('end', () => {
		message.edit({ components: [] }).catch(() => {});
	});
}

export default {
	data: new SlashCommandBuilder()
		.setName('dex-moves')
		.setDescription(
			'Provides information about a Pokémon move or searches for a list of moves based on criteria.',
		)
		.addSubcommandGroup((group) =>
			group
				.setName('move-info')
				.setDescription('Provides information about a Pokémon move.')
				.addSubcommand((sub) =>
					sub
						.setName('move')
						.setDescription(
							'Provides information about a Pokémon move e.g. Glaciate, Searing Shot, Toxic Thread, etc.',
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('move')
								.setDescription('Enter the move name.')
								.setRequired(true),
						),
				),
		)
		.addSubcommandGroup((group) =>
			group
				.setName('filter-list')
				.setDescription('Provides a list of moves based on chosen criteria.')
				.addSubcommand((sub) =>
					sub
						.setName('filters')
						.setDescription(
							'Provides a list of moves based on chosen criteria.',
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('type')
								.setDescription('Enter the move type.')
								.addChoices(...typeChoices)
								.setRequired(false),
						)
						.addIntegerOption((option: SlashCommandIntegerOption) =>
							option
								.setName('min_power')
								.setDescription('Enter the minimum base power.')
								.setMinValue(0)
								.setMaxValue(500)
								.setRequired(false),
						)
						.addIntegerOption((option: SlashCommandIntegerOption) =>
							option
								.setName('max_power')
								.setDescription('Enter the maximum base power.')
								.setMinValue(0)
								.setMaxValue(500)
								.setRequired(false),
						)
						.addIntegerOption((option: SlashCommandIntegerOption) =>
							option
								.setName('min_accuracy')
								.setDescription('Enter minimum accuracy.')
								.setMinValue(0)
								.setMaxValue(101)
								.setRequired(false),
						)
						.addIntegerOption((option: SlashCommandIntegerOption) =>
							option
								.setName('max_accuracy')
								.setDescription('Enter maximum accuracy.')
								.setMinValue(0)
								.setMaxValue(101)
								.setRequired(false),
						)

						.addIntegerOption((option: SlashCommandIntegerOption) =>
							option
								.setName('priority')
								.setDescription('Enter move accuracy. (Perfect = 101)')
								.setMinValue(-7)
								.setMaxValue(5)
								.setRequired(false),
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('category')
								.setDescription('Physical, Special, Status?')
								.addChoices(
									{ name: 'Physical', value: 'physical' },
									{ name: 'Special', value: 'special' },
									{ name: 'Status', value: 'status' },
								)
								.setRequired(false),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('pokemon')
						.setDescription(
							'Provides a list of Pokemon that can learn the move.',
						)
						.addStringOption((option) =>
							option
								.setName('move')
								.setDescription('Enter the Move name.')
								.setRequired(true),
						)
						.addStringOption((option) =>
							option
								.setName('type-1')
								.setDescription('Enter the move type.')
								.addChoices(...typeChoices)
								.setRequired(false),
						)
						.addStringOption((option) =>
							option
								.setName('type-2')
								.setDescription('Enter the move type.')
								.addChoices(...typeChoices)
								.setRequired(false),
						),
				),
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const sub = interaction.options.getSubcommand();
		const group = interaction.options.getSubcommandGroup();

		if (group === 'move-info' && sub === 'move') {
			const moveName = formatUserInput(
				interaction.options.getString('move', true),
			);

			try {
				await interaction.deferReply();

				const result = matchMoveName(moveName);

				const moveInfo = extractMoveInfo(
					await moveEndPoint(result.bestMatch.name),
				);

				// Create an embed with enhanced layout
				const embed = createAttackEmbed(interaction, moveInfo);

				await interaction.editReply({ embeds: [embed] });

				// Send the paginated list of Pokémon
				await movePaginatedList(
					interaction,
					moveInfo.name,
					moveInfo.learned_by_pokemon,
				);

				await interaction.followUp({
					content: `Best Match for ${moveName}: ${
						result.bestMatch.name
					}\n\nOther matches:\n${result.otherMatches
						.map((move) => move.name)
						.join('\n')}`,
					flags: MessageFlags.Ephemeral,
				});
			} catch (error) {
				console.error('Error fetching move data:', error);

				const errorEmbed = new EmbedBuilder()
					.setColor(0xff0000)
					.setTitle('❌ Move Not Found')
					.setDescription(
						`Could not find a move named "${moveName}". Please check the spelling and try again.`,
					)
					.addFields({
						name: '💡 Tips',
						value:
							'• Use the exact move name\n• Check for typos\n• Example: "tackle" or "hyper-beam"',
					})
					.setTimestamp();

				if (interaction.replied || interaction.deferred) {
					await interaction.editReply({ embeds: [errorEmbed] });
				} else {
					await interaction.reply({ embeds: [errorEmbed] });
				}
			}
		} else if (group === 'filter-list' && sub === 'filters') {
			try {
				const type = interaction.options.getString('type');
				const max = interaction.options.getInteger('max_power');
				const min = interaction.options.getInteger('min_power');
				const min_acc = interaction.options.getInteger('min_accuracy');
				const max_acc = interaction.options.getInteger('max_accuracy');
				const priority = interaction.options.getInteger('priority');
				const category = interaction.options.getString('category');

				await interaction.deferReply();

				const filters = {
					type,
					maxPower: max,
					minPower: min,
					minAcc: min_acc,
					maxAcc: max_acc,
					priority,
					category,
				};

				const predicates = {
					type: (move, value) => move.type === value,

					minPower: (move, value) => move.power !== null && move.power >= value,

					maxPower: (move, value) => move.power !== null && move.power <= value,

					minAcc: (move, value) =>
						move.accuracy !== null && move.accuracy >= value,

					maxAcc: (move, value) =>
						move.accuracy !== null && move.accuracy <= value,

					priority: (move, value) =>
						move.priority != null && move.priority === value,
					category: (move, value) =>
						move.category != null && move.category === value,
				};

				const isDeclared = (value) => value !== null && value !== undefined;

				const filteredList = movesList.filter((move) => {
					return Object.entries(filters).every(([key, value]) => {
						if (!isDeclared(value)) return true;
						return predicates[key](move, value);
					});
				});

				const activeFilters = Object.fromEntries(
					Object.entries(filters).filter(([, value]) => isDeclared(value)),
				);

				await sendPaginatedMoveEmbed({
					interaction,
					moves: filteredList,
					activeFilters,
				});
			} catch (err) {
				interaction.editReply(`${err}`);
			}
		} else if (group === 'filter-list' && sub === 'pokemon') {
			const type1 = interaction.options.getString('type-1');
			const type2 = interaction.options.getString('type-2');
			const moveName = formatUserInput(
				interaction.options.getString('move', true),
			);

			try {
				await interaction.deferReply();

				const learners = new Set(
					moveLearnList
						.filter((move) => move.name === moveName)
						.flatMap((move) => move.learned_by_pokemon),
				);

				if (learners.size === 0) {
					return interaction.editReply(`${moveName} was not found.`);
				}

				const matches = pokemonList.filter((p) => {
					if (!learners.has(p.name)) return false;

					if (!type1 && !type2) return true;

					return (
						(type1 && p.types.includes(type1)) ||
						(type2 && p.types.includes(type2))
					);
				});

				await sendPaginatedPokemonEmbed({
					interaction,
					matches,
				});

				// Search pokemonlist for each learner then check if the types match
			} catch (err) {
				interaction.editReply(`${err}`);
			}
		}
	},
};
