import {
	SlashCommandBuilder,
	SlashCommandStringOption,
	EmbedBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { moveEndPoint } from '~/api/endpoints';
import { formatUserInput } from '~/utility/formatting/formatUserInput.ts';
import { extractMoveInfo } from '~/api/dataExtraction/extractMoveInfo.ts';
import { createAttackEmbed } from '~/components/embeds/createAttackEmbed';
import { movePaginatedList } from '~/components/pagination/movePagination';

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
			await movePaginatedList(
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
