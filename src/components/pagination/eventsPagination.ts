import {
	ChatInputCommandInteraction,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} from 'discord.js';

const ITEMS_PER_PAGE = 5;

export async function paginateEvents(
	interaction: ChatInputCommandInteraction,
	events: any[],
	filter: number,
) {
	let currentPage = 0;

	const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);

	function generateEmbed(page: number) {
		const start = page * ITEMS_PER_PAGE;
		const end = start + ITEMS_PER_PAGE;
		const pageItems = events.slice(start, end);

		const filterText =
			filter === 0 ? 'Not Completed' : filter === 1 ? 'Completed' : 'Both';

		const header = `Title                | Date       | Status`;
		const divider = `--------------------------------------------`;

		const rows = pageItems
			.map((e) => {
				const title = e.title.padEnd(20).slice(0, 20);
				const date = (e.event_date ?? 'None').padEnd(10);
				const status = e.completed ? 'Completed' : 'Pending';
				return `${title} | ${date} | ${status}`;
			})
			.join('\n');

		const table = `\`\`\`
${header}
${divider}
${rows}
\`\`\``;

		return new EmbedBuilder()
			.setTitle(`Events (${filterText})`)
			.setDescription(table)
			.setFooter({
				text: `Page ${page + 1} of ${totalPages}`,
			});
	}

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('prev')
			.setLabel('Previous')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('next')
			.setLabel('Next')
			.setStyle(ButtonStyle.Secondary),
	);

	const message = await interaction.editReply({
		embeds: [generateEmbed(currentPage)],
		components: totalPages > 1 ? [row] : [],
	});

	if (totalPages <= 1) return;

	const collector = message.createMessageComponentCollector({
		time: 60000,
	});

	collector.on('collect', async (i) => {
		if (i.user.id !== interaction.user.id) {
			return i.reply({
				content: 'You cannot control this pagination.',
				ephemeral: true,
			});
		}

		if (i.customId === 'prev' && currentPage > 0) {
			currentPage--;
		}

		if (i.customId === 'next' && currentPage < totalPages - 1) {
			currentPage++;
		}

		await i.update({
			embeds: [generateEmbed(currentPage)],
		});
	});
}
