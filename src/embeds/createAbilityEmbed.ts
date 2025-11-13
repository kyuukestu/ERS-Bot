import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { type AbilityInfo } from '~/api/dataExtraction/extractAbilityInfo.ts';
export const createAbilityEmbed = (
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
