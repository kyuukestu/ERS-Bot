import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
} from 'discord.js';
import { formatUserInput } from '~/utility/formatting/formatUserInput.ts';
import { matchMoveName } from '~/utility/fuzzy-search/moves.ts';
import { extractMoveInfo } from '~/api/dataExtraction/extractMoveInfo.ts';
import { moveEndPoint } from '~/api/endpoints';
import { createAttackEmbed } from '~/components/embeds/createAttackEmbed';
import { movePaginatedList } from '~/components/pagination/movePagination';

export async function getMoveInfo(interaction: ChatInputCommandInteraction) {
	const moveName = formatUserInput(interaction.options.getString('move', true));

	try {
		await interaction.deferReply();

		const result = matchMoveName(moveName);

		const moveInfo = extractMoveInfo(await moveEndPoint(result.bestMatch.name));

		// Create an embed with enhanced layout
		const embed = createAttackEmbed(interaction, moveInfo);

		await interaction.editReply({ embeds: [embed] });

		// Send the paginated list of Pokémon
		await movePaginatedList(
			interaction,
			moveInfo.name,
			moveInfo.learned_by_pokemon,
		);

		await interaction.followUp({
			content: `Best Match for ${moveName}: ${
				result.bestMatch.name
			}\n\nOther matches:\n${result.otherMatches
				.map((move) => move.name)
				.join('\n')}`,
			flags: MessageFlags.Ephemeral,
		});
	} catch (error) {
		console.error('Error fetching move data:', error);

		const errorEmbed = new EmbedBuilder()
			.setColor(0xff0000)
			.setTitle('❌ Move Not Found')
			.setDescription(
				`Could not find a move named "${moveName}". Please check the spelling and try again.`,
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
}
