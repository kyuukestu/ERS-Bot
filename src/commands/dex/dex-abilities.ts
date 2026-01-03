import {
	MessageFlags,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { abilityEndPoint } from '~/api/endpoints.ts';
import { formatUserInput } from '../../utility/formatting/formatUserInput.ts';
import { extractAbilityInfo } from '~/api/dataExtraction/extractAbilityInfo.ts';
import { createAbilityEmbed } from '~/components/embeds/createAbilityEmbed.ts';
import { abilityPaginationList } from '~/components/pagination/abilityPagination.ts';
import { matchAbilityName } from '~/utility/fuzzy-search/abilities.ts';

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

			const result = matchAbilityName(abilityName);

			if (!result) {
				throw new Error(`No results found for "${abilityName}"`);
			}

			const abilityInfo = extractAbilityInfo(
				await abilityEndPoint(result.bestMatch.name)
			);

			const embed = createAbilityEmbed(interaction, abilityInfo);

			await interaction.editReply({ embeds: [embed] });

			await abilityPaginationList(
				interaction,
				abilityInfo.name,
				abilityInfo.pokemon ?? []
			);

			await interaction.followUp({
				content: `Best Match for ${abilityName}: ${
					result.bestMatch.name
				}\n\nOther matches:\n${result.otherMatches
					.map((item) => item.name)
					.join('\n')}`,
				flags: MessageFlags.Ephemeral,
			});
		} catch (error) {
			console.error('Error fetching ability data:', error);
		}
	},
};
