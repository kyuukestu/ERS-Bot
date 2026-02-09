import {
	EmbedBuilder,
	ActionRowBuilder,
	SlashCommandBuilder,
	ButtonBuilder,
	type SlashCommandStringOption,
	ButtonStyle,
	StringSelectMenuBuilder,
	type ChatInputCommandInteraction,
	MessageFlags,
} from 'discord.js';
import { extractFakemonInfo } from '~/api/dataExtraction/extractFakemonInfoFuse';
import type { Fakemon } from '~/api/dataExtraction/extractFakemonInfoFuse.ts';
import { formatUserInput } from '~/utility/formatting/formatUserInput';
import { matchPokemonSpecies } from '~/utility/fuzzy-search/pokemon';
import type {
	LearnMethodKey,
	NormalizeFakemonMove,
	FakeGroupedMove,
	FakeGroupedMoves,
	FakeMoveMethod,
} from '~/types/learnSetTypes';
// import { version_convert } from '~/utility/formatting/formatVersion';

/* ============================================================
 * Types & Config
 * ============================================================ */

export const learnMethodConfig: Record<
	LearnMethodKey,
	{ label: string; emoji: string; color: number }
> = {
	'level-up': { label: 'Level Up', emoji: '📈', color: 0x57f287 },
	machine: { label: 'Machine', emoji: '💿', color: 0x5865f2 },
	tutor: { label: 'Tutor', emoji: '🎓', color: 0xeb459e },
	egg: { label: 'Breeding', emoji: '🥚', color: 0xfee75c },
	other: { label: 'Other', emoji: '⚡', color: 0x99aab5 },
};

/* ============================================================
 * Helpers
 * ============================================================ */

export const normalizeLearnMethod = (method: string): LearnMethodKey => {
	if (method === 'level-up') return 'level-up';
	if (method === 'machine') return 'machine';
	if (method === 'tutor') return 'tutor';
	if (method === 'egg') return 'egg';
	return 'other';
};

export const formatMoveName = (name: string): string =>
	name
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');

/* ============================================================
 * Data Processing
 * ============================================================ */

export const processMoveData = (data: unknown): NormalizeFakemonMove[] => {
	const parsed: Fakemon = data as Fakemon;

	return parsed.moves.map((move) => ({
		name: move.name,
		methods: move.methods.map((detail) => ({
			method: normalizeLearnMethod(detail.method),
			level: detail.level || undefined,
		})),
	}));
};

export const getLowestLevelUp = (
	methods: FakeMoveMethod[],
): number | undefined => {
	const levels = methods
		.filter(
			(m) => m.method === 'level-up' && m.level !== undefined && m.level > 0,
		)
		.map((m) => m.level);

	if (levels.length === 0) return undefined;
	const filteredLevels = levels.filter((level) => typeof level === 'number');
	return Math.min(...filteredLevels);
};

export const groupAndSortMoves = (
	moves: NormalizeFakemonMove[],
): FakeGroupedMoves => {
	const grouped: FakeGroupedMoves = {
		'level-up': [],
		machine: [],
		tutor: [],
		egg: [],
		other: [],
	};

	for (const move of moves) {
		const uniqueMethods = new Set(move.methods.map((m) => m.method));

		for (const method of uniqueMethods) {
			if (method === 'level-up') {
				grouped['level-up'].push({
					name: formatMoveName(move.name),
					level: getLowestLevelUp(move.methods),
					otherMethods: [...uniqueMethods].filter((m) => m !== 'level-up'),
				});
				continue;
			}

			// non–level-up methods
			grouped[method].push({
				name: formatMoveName(move.name),

				otherMethods: [...uniqueMethods].filter((m) => m !== method),
			});
		}
	}

	grouped['level-up'].sort(
		(a, b) =>
			(a.level ?? Number.MAX_SAFE_INTEGER) -
			(b.level ?? Number.MAX_SAFE_INTEGER),
	);

	for (const key of ['machine', 'tutor', 'egg', 'other'] as const) {
		grouped[key].sort((a, b) => a.name.localeCompare(b.name));
	}

	return grouped;
};

export const formatMoveLine = (
	move: FakeGroupedMove,
	method: LearnMethodKey,
): string => {
	// const config = learnMethodConfig[method];
	const altIcons =
		move.otherMethods.length > 0
			? ` ${move.otherMethods.map((m) => learnMethodConfig[m].emoji).join('')}`
			: '';
	// const version = version_convert(move.version);

	if (method === 'level-up') {
		return move.level
			? `Lv.${move.level} | **${move.name}** ${altIcons}`
			: `Start.${move.level} **${move.name}** ${altIcons}`;
	}

	return `**${move.name}** ${altIcons} `;
};

/* ============================================================
 * Command
 * ============================================================ */

export default {
	data: new SlashCommandBuilder()
		.setName('fakedex-learn-set')
		.setDescription("View a Pokémon's learnable moves.")
		.addSubcommand((sub) =>
			sub
				.setName('all')
				.setDescription('View all learnable moves.')
				.addStringOption((o: SlashCommandStringOption) =>
					o
						.setName('pokemon')
						.setDescription('Enter the Pokémon name.')
						.setRequired(true),
				)
				.addStringOption((o: SlashCommandStringOption) =>
					o
						.setName('form')
						.setDescription('Enter the form name.')
						.setRequired(false),
				),
		)
		.addSubcommand((sub) =>
			sub
				.setName('level-up')
				.setDescription('View level-up moves.')
				.addStringOption((o: SlashCommandStringOption) =>
					o
						.setName('pokemon')
						.setDescription('Enter the Pokémon name.')
						.setRequired(true),
				)
				.addStringOption((o: SlashCommandStringOption) =>
					o
						.setName('form')
						.setDescription('Enter the form name.')
						.setRequired(false),
				),
		)
		.addSubcommand((sub) =>
			sub
				.setName('machine')
				.setDescription('View machine moves.')
				.addStringOption((o: SlashCommandStringOption) =>
					o
						.setName('pokemon')
						.setDescription('Enter the Pokémon name.')
						.setRequired(true),
				)
				.addStringOption((o: SlashCommandStringOption) =>
					o
						.setName('form')
						.setDescription('Enter the form name.')
						.setRequired(false),
				),
		)
		.addSubcommand((sub) =>
			sub
				.setName('tutor')
				.setDescription('View tutor moves.')
				.addStringOption((o: SlashCommandStringOption) =>
					o
						.setName('pokemon')
						.setDescription('Enter the Pokémon name.')
						.setRequired(true),
				)
				.addStringOption((o: SlashCommandStringOption) =>
					o
						.setName('form')
						.setDescription('Enter the form name.')
						.setRequired(false),
				),
		)
		.addSubcommand((sub) =>
			sub
				.setName('egg')
				.setDescription('View egg moves.')
				.addStringOption((o: SlashCommandStringOption) =>
					o
						.setName('pokemon')
						.setDescription('Enter the Pokémon name.')
						.setRequired(true),
				)
				.addStringOption((o: SlashCommandStringOption) =>
					o
						.setName('form')
						.setDescription('Enter the form name.')
						.setRequired(false),
				),
		)
		.addSubcommand((sub) =>
			sub
				.setName('other')
				.setDescription('View other moves.')
				.addStringOption((o: SlashCommandStringOption) =>
					o
						.setName('pokemon')
						.setDescription('Enter the Pokémon name.')
						.setRequired(true),
				),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const sub = interaction.options.getSubcommand();
		const pokemonInput = formatUserInput(
			interaction.options.getString('pokemon', true),
		);
		const form = interaction.options.getString('form') ?? '';
		const fakemon = interaction.options.getBoolean('fakemon') ?? false;

		await interaction.deferReply();

		try {
			const searchName = pokemonInput + (form ? `-${form}` : '');

			const { speciesName, formName } = await matchPokemonSpecies(searchName);
			const apiName = formName || speciesName;
			//TODO: Fakemon Check here

			if (fakemon) {
				await interaction.editReply(
					`❌ ${pokemonInput} is not a real Pokemon.`,
				);
				return;
			}

			const fakemonData = await extractFakemonInfo(
				apiName.toLowerCase().trim(),
			);

			const name = fakemonData.name;
			const sprite = fakemonData.sprite;
			const defaultSprite = '../../../public/sprites-fakemon/MissingNo.1.webp';

			const moves = processMoveData(fakemonData);
			const groupedMoves = groupAndSortMoves(moves);

			// Filter by subcommand
			const methods = Object.keys(groupedMoves).filter(
				(m) => groupedMoves[m as LearnMethodKey].length > 0,
			) as LearnMethodKey[];

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

			const generateEmbed = () => {
				const method = methods[methodIndex];
				const config = learnMethodConfig[method];
				const methodMoves = groupedMoves[method];
				const totalPages = Math.ceil(methodMoves.length / movesPerPage);

				const slice = methodMoves.slice(
					page * movesPerPage,
					page * movesPerPage + movesPerPage,
				);

				return new EmbedBuilder()
					.setTitle(`📖 ${name} • ${config.emoji} ${config.label}`)
					.setColor(config.color)
					.addFields({
						name: `${config.label} Moves (${methodMoves.length})`,
						value: slice.map((m) => formatMoveLine(m, method)).join('\n'),
					})
					.setFooter({
						text: `${config.label} • Page ${page + 1}/${totalPages}`,
					});
			};

			const createButtons = (): ActionRowBuilder<ButtonBuilder> =>
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId('prev')
						.setLabel('◀')
						.setStyle(ButtonStyle.Secondary),
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('▶')
						.setStyle(ButtonStyle.Secondary),
				);

			const createJumpMenu = (): ActionRowBuilder<StringSelectMenuBuilder> => {
				return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('jump_select')
						.setPlaceholder('🔍 Jump to a specific move category')
						.addOptions(
							methods.map((m, idx) => {
								const config = learnMethodConfig[m];
								return {
									label: config.label,
									value: idx.toString(),
									description: `View ${config.label.toLowerCase()} moves`,
									emoji: config.emoji,
								};
							}),
						),
				);
			};

			const buttonRow = createButtons();
			const jumpRow = sub === 'all' ? createJumpMenu() : undefined;

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
