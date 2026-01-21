import type { ChatInputCommandInteraction } from 'discord.js';
import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
} from 'discord.js';
export const abilityPaginationList = async (
	interaction: ChatInputCommandInteraction,
	abilityName: string,
	pokemon: string[],
) => {
	const monsPerPage = 10;
	let currentPage = 0;

	// Sort the Pokémon names alphabetically
	const sortedPossession = [...pokemon].sort((a, b) =>
		a.localeCompare(b, undefined, { sensitivity: 'base' }),
	);

	const totalPages = Math.ceil(sortedPossession.length / monsPerPage);

	const formattedAbilityName = abilityName
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	const generateEmbed = (page: number) => {
		const start = page * monsPerPage;
		const end = start + monsPerPage;
		const currentMons =
			sortedPossession
				.slice(start, end)
				.map((name) => `• ${name}`)
				.join('\n') || 'No Pokémon found.';

		return new EmbedBuilder()
			.setTitle(`${formattedAbilityName} is possessed by:`)
			.setDescription(currentMons)
			.setFooter({
				text: `Page ${page + 1}/${totalPages} | Total: ${
					sortedPossession.length
				} Pokémon`,
			});
	};

	// Create buttons
	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('previous')
			.setLabel('⬅️ Previous')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(currentPage === 0),
		new ButtonBuilder()
			.setCustomId('next')
			.setLabel('➡️ Next')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(currentPage >= totalPages - 1),
	);

	const message = await interaction.followUp({
		embeds: [generateEmbed(currentPage)],
		components: [row.toJSON()],
		fetchReply: true,
		flags: MessageFlags.Ephemeral,
	});

	// Create a collector for button interactions
	const collector = message.createMessageComponentCollector({
		time: 60000, // 1 minute timeout
	});

	collector.on('collect', async (buttonInteraction) => {
		if (buttonInteraction.customId === 'previous') currentPage--;
		if (buttonInteraction.customId === 'next') currentPage++;
		collector.resetTimer();

		// Update the buttons
		const updatedRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('previous')
				.setLabel('⬅️ Previous')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentPage === 0),
			new ButtonBuilder()
				.setCustomId('next')
				.setLabel('➡️ Next')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentPage >= totalPages - 1),
		);

		await buttonInteraction.update({
			embeds: [generateEmbed(currentPage)],
			components: [updatedRow.toJSON()],
		});
	});

	collector.on('end', () => {
		const disabledRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('previous')
				.setLabel('⬅️ Previous')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true),
			new ButtonBuilder()
				.setCustomId('next')
				.setLabel('➡️ Next')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true),
		);

		message.edit({ components: [disabledRow.toJSON()] }).catch(console.error);
	});
};
