import {
	SlashCommandBuilder,
	SlashCommandStringOption,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	MessageFlags,
} from 'discord.js';
import { typeColors } from '~/ui/colors.ts';
import { moveEndPoint } from '~/api/endpoints';
import { formatUserInput } from '~/utility/formatting/formatUserInput.ts';
import { extractMoveInfo } from '~/api/dataExtraction/extractMoveInfo.ts';
import { createAttackEmbed } from '~/embeds/createAttackEmbed';

export default {
	data: new SlashCommandBuilder()
		.setName('dex-moves')
		.setDescription(
			'Provides information about a Pokémon move e.g. Glaciate, Searing Shot, Toxic Thread, etc.'
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('move')
				.setDescription('Enter the move name.')
				.setRequired(true)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const moveName = formatUserInput(
			interaction.options.getString('move', true)
		);

		try {
			await interaction.deferReply();

			const moveInfo = extractMoveInfo(await moveEndPoint(moveName));

			// Create an embed with enhanced layout
			const embed = createAttackEmbed(interaction, moveInfo);

			await interaction.editReply({ embeds: [embed] });

			// Send the paginated list of Pokémon
			await sendPaginatedList(
				interaction,
				moveInfo.name,
				moveInfo.learned_by_pokemon
			);
		} catch (error) {
			console.error('Error fetching move data:', error);

			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('❌ Move Not Found')
				.setDescription(
					`Could not find a move named "${moveName}". Please check the spelling and try again.`
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
	},
};

async function sendPaginatedList(
	interaction: ChatInputCommandInteraction,
	moveName: string,
	learnedBy: string[]
) {
	const monsPerPage = 10;
	let currentPage = 0;

	// Sort the Pokémon names alphabetically
	const sortedLearnedBy = [...learnedBy].sort((a, b) =>
		a.localeCompare(b, undefined, { sensitivity: 'base' })
	);

	const totalPages = Math.ceil(sortedLearnedBy.length / monsPerPage);

	const formattedMoveName = moveName
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	const generateEmbed = (page: number) => {
		const start = page * monsPerPage;
		const end = start + monsPerPage;
		const currentMons =
			sortedLearnedBy
				.slice(start, end)
				.map((name) => `• ${name}`)
				.join('\n') || 'No Pokémon found.';

		return new EmbedBuilder()
			.setTitle(`${formattedMoveName} is learned by:`)
			.setDescription(currentMons)
			.setFooter({
				text: `Page ${page + 1}/${totalPages} | Total: ${
					sortedLearnedBy.length
				} Pokémon`,
			})
			.setColor(typeColors['normal']);
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
			.setDisabled(currentPage >= totalPages - 1)
	);

	const message = await interaction.followUp({
		embeds: [generateEmbed(currentPage)],
		components: [row.toJSON()],
		fetchReply: true,
	});

	// Create a collector for button interactions
	const collector = message.createMessageComponentCollector({
		time: 60000, // 1 minute timeout
	});

	collector.on('collect', async (buttonInteraction) => {
		// Verify the user is the original command invoker
		if (buttonInteraction.user.id !== interaction.user.id) {
			await buttonInteraction.reply({
				content: 'These buttons are not for you!',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

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
				.setDisabled(currentPage >= totalPages - 1)
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
				.setDisabled(true)
		);

		message.edit({ components: [disabledRow.toJSON()] }).catch(console.error);
	});
}
