import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { type MoveInfo } from '~/api/dataExtraction/extractMoveInfo';
import { typeColors } from '~/ui/colors';
import { moveEmojis } from '~/ui/emojis';
export const createAttackEmbed = (
	interaction: ChatInputCommandInteraction,
	moveInfo: MoveInfo
) => {
	const embed = new EmbedBuilder()
		.setColor(typeColors[moveInfo.type] || typeColors['normal'])
		.setTitle(
			`${moveEmojis[moveInfo.damage_class] || '❓'} **${moveInfo.name}**`
		)
		.setDescription(moveInfo.flavor_text.replace(/\r?\n|\r/g, ' '))
		.addFields(
			{
				name: '📌 Type',
				value: moveInfo.type.charAt(0).toUpperCase() + moveInfo.type.slice(1),
				inline: true,
			},
			{
				name: '🏹 Damage Class',
				value:
					moveInfo.damage_class.charAt(0).toUpperCase() +
					moveInfo.damage_class.slice(1),
				inline: true,
			},
			{ name: '💪 Power', value: moveInfo.power, inline: true },
			{ name: '🎯 Accuracy', value: moveInfo.accuracy, inline: true },
			{
				name: '🎲 Effect Chance',
				value: moveInfo.effect_chance,
				inline: true,
			},
			{ name: '⏱️ Priority', value: moveInfo.priority, inline: true },
			{ name: '🔋 PP', value: moveInfo.pp, inline: true },
			{ name: '🎯 Target', value: moveInfo.target, inline: true },
			{ name: '🌍 Generation', value: moveInfo.generation, inline: true },
			{
				name: '📅 Version',
				value:
					moveInfo.flavor_text_ver.charAt(0).toUpperCase() +
					moveInfo.flavor_text_ver.slice(1),
				inline: true,
			}
		)
		.setFooter({
			text: `Requested by ${interaction.user.username} • Powered by PokeAPI`,
			iconURL: interaction.user.displayAvatarURL(),
		})
		.setTimestamp();

	return embed;
};
