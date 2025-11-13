import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { type ItemInfo } from '~/api/dataExtraction/extractItemInfo';
import { itemCategoryColors } from '~/ui/colors';
export const createItemEmbed = (
	interaction: ChatInputCommandInteraction,
	itemInfo: ItemInfo
) => {
	const embed = new EmbedBuilder()
		.setColor(
			itemCategoryColors[itemInfo.category] || itemCategoryColors['other']
		)
		.setTitle(`${itemInfo.item_emoji || '❓'} **${itemInfo.name}**`)
		.setDescription(itemInfo.flavor_text_entries.replace(/\r?\n|\r/g, ' '))
		.setThumbnail(itemInfo.sprites.default)
		.addFields(
			{
				name: '📌 Category',
				value:
					itemInfo.category.charAt(0).toUpperCase() +
					itemInfo.category.slice(1),
				inline: true,
			},
			{
				name: '💰 Cost',
				value: itemInfo.cost.toLocaleString() + ' ₱',
				inline: true,
			},
			{
				name: '⚡ Fling Power',
				value: itemInfo.fling_power ? itemInfo.fling_power.toString() : 'N/A',
				inline: true,
			},
			{
				name: '🎯 Fling Effect',
				value: itemInfo.fling_effect || 'None',
				inline: true,
			},
			{
				name: '📝 Effect',
				value: itemInfo.effect.replace(/\r?\n|\r/g, ' '),
				inline: false,
			},
			{
				name: '📅 Version',
				value: itemInfo.flavor_text_ver,
				inline: false,
			}
		)
		.setFooter({
			text: `Requested by ${interaction.user.username}`,
			iconURL: interaction.user.displayAvatarURL(),
		})
		.setTimestamp();

	return embed;
};
