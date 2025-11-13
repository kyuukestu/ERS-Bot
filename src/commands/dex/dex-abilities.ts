import {
	EmbedBuilder,
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { abilityEndPoint } from '~/api/endpoints.ts';
import { formatUserInput } from '../../utility/formatting/formatUserInput.ts';
import {
	extractAbilityInfo,
	type AbilityInfo,
} from '~/api/dataExtraction/extractAbilityInfo.ts';

const createAbilityEmbed = (
	interaction: ChatInputCommandInteraction,
	abilityInfo: AbilityInfo
): EmbedBuilder => {
	return new EmbedBuilder()
		.setColor(abilityInfo.color)
		.setTitle(`${abilityInfo.emoji} **${abilityInfo.name}**`)
		.setDescription(abilityInfo.effect.replace(/\r?\n|\r/g, ' '))
		.addFields(
			{
				name: '📌 Generation',
				value: abilityInfo.generation,
				inline: true,
			},
			{
				name: '🎯 Effect Chance',
				value: abilityInfo.effectChance,
				inline: true,
			}
		)
		.setFooter({
			text: `Requested by ${interaction.user.username} • Powered by PokeAPI`,
			iconURL: interaction.user.displayAvatarURL(),
		})
		.setTimestamp();
};

export default {
	data: new SlashCommandBuilder()
		.setName('dex-abilities')
		.setDescription(
			'Provides information about a Pokémon ability, e.g. Speed Boost, Immunity, Huge Power, etc.'
		)
		.addStringOption((option) =>
			option
				.setName('ability')
				.setDescription("The Ability's name.")
				.setRequired(true)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const abilityName = formatUserInput(
			interaction.options.getString('ability', true)
		);

		try {
			await interaction.deferReply();

			const abilityInfo = extractAbilityInfo(
				await abilityEndPoint(abilityName)
			);

			const embed = createAbilityEmbed(interaction, abilityInfo);

			await interaction.editReply({ embeds: [embed] });

			await sendPaginatedList(
				interaction,
				abilityInfo.name,
				abilityInfo.pokemon ?? []
			);
		} catch (error) {
			console.error('Error fetching ability data:', error);

			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('❌ Ability Not Found')
				.setDescription(
					`Could not find an ability named "${abilityName}". Please check the spelling and try again.`
				)
				.addFields({
					name: '💡 Tips',
					value:
						'• Use the exact ability name\n• Check for typos\n• Example: "overgrow" or "drizzle"',
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

const sendPaginatedList = async (
	interaction: ChatInputCommandInteraction,
	abilityName: string,
	pokemon: string[]
) => {
	const monsPerPage = 10;
	let currentPage = 0;

	// Sort the Pokémon names alphabetically
	const sortedPossession = [...pokemon].sort((a, b) =>
		a.localeCompare(b, undefined, { sensitivity: 'base' })
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
};
