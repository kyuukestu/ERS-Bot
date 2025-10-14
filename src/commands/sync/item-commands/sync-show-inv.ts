import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	MessageFlags,
} from 'discord.js';
import OC from '../../../models/OCSchema';
import { type ItemDocument } from '../../../models/ItemSchema';
import { isDBConnected } from '../../../mongoose/connection';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-show-inv')
		.setDescription("Displays your OC's inventory.")
		.addStringOption((option) =>
			option
				.setName('oc-name')
				.setDescription("Your registered OC's name")
				.setRequired(true)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();

		const OCName = interaction.options.getString('oc-name', true);

		if (!isDBConnected()) {
			return interaction.followUp({
				content:
					'⚠️ Database is currently unavailable. Please try again later.',
				flags: MessageFlags.Ephemeral,
			});
		}

		const targetOC = await OC.findOne({ name: OCName }).populate<{
			item: ItemDocument;
		}>('inventory.item');

		if (!targetOC) {
			return interaction.followUp({
				content: `❌ OC **${OCName}** does not exist.`,
				flags: MessageFlags.Ephemeral,
			});
		}

		const items = targetOC.inventory
			.map((entry) => {
				const item = entry.item as ItemDocument | null;
				if (!item) return null;
				return { name: item.name, quantity: entry.quantity };
			})
			.filter(Boolean) as { name: string; quantity: number }[];

		if (items.length === 0) {
			return interaction.editReply({
				content: `🧳 OC **${targetOC.name}** has an empty inventory.`,
			});
		}

		// Pagination setup
		const itemsPerPage = 20;
		let currentPage = 0;
		const totalPages = Math.ceil(items.length / itemsPerPage);

		const getPageEmbed = (page: number) => {
			const start = page * itemsPerPage;
			const end = start + itemsPerPage;
			const pageItems = items.slice(start, end);

			const description = pageItems
				.map(
					(item, idx) =>
						`${start + idx + 1}. **${item.name}** × ${item.quantity}`
				)
				.join('\n');

			return new EmbedBuilder()
				.setTitle(`🎒 Inventory — ${targetOC.name}`)
				.setDescription(description || '*No items to display.*')
				.setFooter({
					text: `Page ${page + 1}/${totalPages} | Balance: ${
						targetOC.money ?? 0
					}₽`,
				})
				.setColor(0x6a5acd);
		};

		// Buttons
		const getButtons = (page: number) => {
			return new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId('prev')
					.setLabel('⬅️ Previous')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(page === 0),
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('Next ➡️')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(page === totalPages - 1)
			);
		};

		// Send first embed
		const message = await interaction.editReply({
			embeds: [getPageEmbed(currentPage)],
			components: [getButtons(currentPage)],
		});

		// Collector for button interactions
		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60_000, // 1 minute
		});

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: "You can't control someone else's inventory view.",
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'next' && currentPage < totalPages - 1) {
				currentPage++;
			} else if (i.customId === 'prev' && currentPage > 0) {
				currentPage--;
			}

			await i.update({
				embeds: [getPageEmbed(currentPage)],
				components: [getButtons(currentPage)],
			});
		});

		collector.on('end', async () => {
			await message.edit({
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId('expired')
							.setLabel('Session Expired')
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true)
					),
				],
			});
		});
	},
};
