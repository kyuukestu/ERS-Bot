import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuBuilder,
} from 'discord.js';
import type {
	LearnMethodKey,
	GroupedMove,
	LearnMethodConfig,
} from '~/types/learnSetTypes';

export const buildEmbedForMoves = (
	name: string,
	sprite: string | null,
	method: LearnMethodKey,
	methodMoves: GroupedMove[],
	page: number,
	movesPerPage: number,
	learnMethodConfig: LearnMethodConfig,
	formatMoveLine: (move: GroupedMove, method: LearnMethodKey) => string,
): EmbedBuilder => {
	const config = learnMethodConfig[method];
	const totalPages = Math.ceil(methodMoves.length / movesPerPage);

	const slice = methodMoves.slice(
		page * movesPerPage,
		page * movesPerPage + movesPerPage,
	);

	return new EmbedBuilder()
		.setTitle(`📖 ${name} • ${config.emoji} ${config.label}`)
		.setThumbnail(sprite)
		.setColor(config.color)
		.addFields({
			name: `${config.label} Moves (${methodMoves.length})`,
			value: slice.map((m) => formatMoveLine(m, method)).join('\n'),
		})
		.setFooter({
			text: `${config.label} • Page ${page + 1}/${totalPages}`,
		});
};

export const buildNavigationButtons = (): ActionRowBuilder<ButtonBuilder> =>
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

export const buildCategoryJumpMenu = (
	methods: LearnMethodKey[],
	learnMethodConfig: LearnMethodConfig,
): ActionRowBuilder<StringSelectMenuBuilder> => {
	const options = methods.map((m, idx) => {
		const config = learnMethodConfig[m];
		return {
			label: config.label,
			value: idx.toString(),
			description: `View ${config.label.toLowerCase()} moves`,
			emoji: config.emoji,
		};
	});

	return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('jump_select')
			.setPlaceholder('🔍 Jump to a specific move category')
			.addOptions(options),
	);
};
