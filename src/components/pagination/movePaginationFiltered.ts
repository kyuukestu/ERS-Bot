import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	ActionRowBuilder,
} from 'discord.js';
import type { MoveListType, MoveType } from '~/types/dexTypes';

interface FilterLabels {
	[key: string]: string;
}

const filterLabels: FilterLabels = {
	type: 'Type',
	minPower: 'Min Power',
	maxPower: 'Max Power',
	minAcc: 'Min Accuracy',
	maxAcc: 'Max Accuracy',
	priority: 'Priority',
	category: 'Category',
};

export async function sendFilteredPaginatedMoveEmbed({
	interaction,
	moves,
	activeFilters = {},
	pageSize = 10,
}: {
	interaction: ChatInputCommandInteraction;
	moves: MoveListType;
	activeFilters?: {
		[k: string]: string | number | null;
	};
	pageSize?: number;
}) {
	const filterText =
		Object.keys(activeFilters).length > 0
			? Object.entries(activeFilters)
					.map(([k, v]) => `${filterLabels[k]}: ${v}`)
					.join(' • ')
			: 'No filters applied';

	const pages: MoveListType[] = [];
	for (let i = 0; i < moves.length; i += pageSize) {
		pages.push(moves.slice(i, i + pageSize));
	}

	const renderPage = (pageIndex: number) => {
		const page = pages[pageIndex];

		return new EmbedBuilder()
			.setTitle('Move Search Results')
			.setDescription(
				page
					.map(
						(move: MoveType) =>
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
		components: pages.length > 1 ? [buttons.toJSON()] : [],
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
			components: [buttons.toJSON()],
		});

		collector.resetTimer();
	});

	collector.on('end', async () => {
		buttons.components.forEach((btn) => {
			if (btn instanceof ButtonBuilder) {
				btn.setDisabled(true);
			}
		});
		await message.edit({ components: [buttons.toJSON()] });
	});
}
