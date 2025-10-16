import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	MessageFlags,
} from 'discord.js';
import OC from '~/database/models/OCSchema.ts';
import TransactionLog from '~/database/models/TransactionLogSchema.ts';
import ServiceLog from '~/database/models/ServiceLogSchema.ts';
import { isDBConnected } from '~/database/mongoose/connection.ts';

async function fetchOCid(OCName: string) {
	const oc = await OC.findOne({ name: OCName });
	if (!oc) throw new Error(`OC "${OCName}" does not exist.`);
	return oc._id;
}

export default {
	data: new SlashCommandBuilder()
		.setName('sync-show-transactions')
		.setDescription('Displays your OC’s transaction and service logs.')
		.addStringOption((option) =>
			option
				.setName('oc-name')
				.setDescription('Your registered OC’s name')
				.setRequired(true)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const OCName = interaction.options.getString('oc-name', true);

		try {
			if (!isDBConnected()) {
				return interaction.reply({
					content: '⚠️ Database unavailable. Try again later.',
					flags: MessageFlags.Ephemeral,
				});
			}

			const targetID = await fetchOCid(OCName);

			// Fetch logs for this OC
			const transactions = await TransactionLog.find({ oc: targetID });
			const services = await ServiceLog.find({ oc: targetID });

			// Merge and normalize both log types
			const combinedLogs = [
				...transactions.map((log) => ({
					type: 'Item',
					name: log.itemNameSnapshot,
					action: log.action,
					quantity: log.quantity,
					reason: log.reason || '—',
					balanceAfter: log.balanceAfter ?? 0,
					createdAt: log.createdAt,
				})),
				...services.map((log) => ({
					type: 'Service',
					name: log.serviceNameSnapshot,
					action: log.action,
					quantity: log.quantity,
					reason: log.reason || '—',
					balanceAfter: log.balanceAfter ?? 0,
					createdAt: log.createdAt,
				})),
			].sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);

			if (combinedLogs.length === 0) {
				return interaction.reply({
					content: `❌ No logs found for **${OCName}**.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			// Pagination setup
			const pageSize = 10;
			let currentPage = 0;
			const totalPages = Math.ceil(combinedLogs.length / pageSize);

			/** 🧩 Helper: Generate Embed for given page */
			const generateEmbed = (page: number) => {
				const start = page * pageSize;
				const pageLogs = combinedLogs.slice(start, start + pageSize);

				const embed = new EmbedBuilder()
					.setTitle(`📜 ${OCName} — Transaction & Service Logs`)
					.setColor(0x3498db)
					.setFooter({ text: `Page ${page + 1} of ${totalPages}` });

				pageLogs.forEach((log) => {
					const date = new Date(log.createdAt).toLocaleString();
					embed.addFields({
						name: `${log.action} — ${log.type}: ${log.name}`,
						value: `**Qty:** ${log.quantity}\n**Reason:** ${log.reason}\n**Balance After:** ${log.balanceAfter}\n**Date:** ${date}`,
						inline: false,
					});
				});

				return embed;
			};

			// Initial embed + buttons
			const embed = generateEmbed(currentPage);
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId('prev')
					.setLabel('◀️ Prev')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId('next')
					.setLabel('Next ▶️')
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(totalPages <= 1)
			);

			const message = await interaction.reply({
				embeds: [embed],
				components: [row],
				fetchReply: true,
			});

			// Collector to handle navigation
			const collector = message.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 60_000,
			});

			collector.on('collect', async (i) => {
				if (i.user.id !== interaction.user.id)
					return i.reply({
						content: 'This log view isn’t yours.',
						flags: MessageFlags.Ephemeral,
					});

				if (i.customId === 'prev') currentPage--;
				else if (i.customId === 'next') currentPage++;

				const newEmbed = generateEmbed(currentPage);
				row.components[0].setDisabled(currentPage === 0);
				row.components[1].setDisabled(currentPage === totalPages - 1);

				await i.update({
					embeds: [newEmbed],
					components: [row],
				});
			});

			collector.on('end', async () => {
				row.components.forEach((btn) => btn.setDisabled(true));
				await message.edit({ components: [row] });
			});
		} catch (err) {
			console.error(err);
			await interaction.reply({
				content: `❌ Error fetching logs for ${OCName}.\n\`\`\`${err}\`\`\``,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
