import {
	EmbedBuilder,
	ActionRowBuilder,
	SlashCommandBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ComponentType,
} from 'discord.js';

import type { Fakemon } from '~/api/dataExtraction/extractFakemonInfoFuse';
import fakemonList from '~/../public/json/fakemon-list.json';

const ITEMS_PER_PAGE = 10;

export default {
	data: new SlashCommandBuilder()
		.setName('dex-list-fakemon')
		.setDescription('Lists all fakemon alphabetically'),

	async execute(interaction: ChatInputCommandInteraction) {
		try {
			await interaction.deferReply();

			const data = fakemonList as Fakemon[];

			// Sort alphabetically by name
			const sorted = data.sort((a, b) => a.name.localeCompare(b.name));

			// Pagination helper
			const generateEmbed = (page: number) => {
				const start = page * ITEMS_PER_PAGE;
				const paginated = sorted.slice(start, start + ITEMS_PER_PAGE);

				const embed = new EmbedBuilder()
					.setTitle('Fakemon List')
					.setDescription(
						`Showing fakemon ${start + 1}-${start + paginated.length} of ${sorted.length}`,
					)
					.addFields(
						paginated.map((f) => ({
							name: f.name,
							value: f.types.join(', '),
							inline: true,
						})),
					);

				return embed;
			};

			let page = 0;
			const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId('prev')
					.setLabel('Previous')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('Next')
					.setStyle(ButtonStyle.Primary)
					.setDisabled(totalPages <= 1),
			);

			const message = await interaction.editReply({
				embeds: [generateEmbed(page)],
				components: [row],
			});

			const collector = message.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 60000, // 1 minute timeout
			});

			collector.on('collect', (btnInteraction) => {
				if (!btnInteraction.isButton()) return;

				if (btnInteraction.user.id !== interaction.user.id) {
					return btnInteraction.reply({
						content: "These buttons aren't for you!",
						ephemeral: true,
					});
				}

				if (btnInteraction.customId === 'prev') page--;
				if (btnInteraction.customId === 'next') page++;

				// Update buttons disabled status
				const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId('prev')
						.setLabel('Previous')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(page === 0),
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('Next')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(page + 1 >= totalPages),
				);

				btnInteraction.update({
					embeds: [generateEmbed(page)],
					components: [newRow],
				});
			});

			collector.on('end', () => {
				const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId('prev')
						.setLabel('Previous')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('Next')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true),
				);
				interaction.editReply({ components: [disabledRow] });
			});
		} catch (error) {
			console.error(`Error executing /dex-list-fakemon: \n\n ${error}`);
			interaction.editReply({
				content: 'An error occurred while fetching fakemon.',
			});
		}
	},
};
