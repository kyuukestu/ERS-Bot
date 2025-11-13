import { itemEndPoint } from '~/api/endpoints';
import { formatUserInput } from '~/utility/formatting/formatUserInput.ts';
import {
	SlashCommandBuilder,
	SlashCommandStringOption,
	EmbedBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import type { ItemData } from '~/interface/apiData';
import { itemCategoryColors } from '~/ui/colors.ts';
import { extractItemInfo } from '~/api/dataExtraction/extractItemInfo.ts';

interface ItemInfo {
	name: string;
	category: string;
	item_emoji: string;
	cost: number;
	effect: string;
	flavor_text_entries: string;
	flavor_text_ver: string;
	sprites: { default: string | null };
	fling_power: number;
	fling_effect: string;
}

const createItemEmbed = (
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

export default {
	data: new SlashCommandBuilder()
		.setName('sync-items')
		.setDescription(
			'Provides information about an item e.g. Flame Orb, Pinap Berry, Thunder Stone, etc.'
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('item')
				.setDescription('Enter the item name.')
				.setRequired(true)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const itemName = formatUserInput(
			interaction.options.get('item', true).value as string
		);

		try {
			await interaction.deferReply();

			const response = await itemEndPoint(itemName);
			const data: ItemData = response as ItemData;
			const itemInfo = extractItemInfo(data);

			const itemkeywords = ['standard-ball', 'special-ball', 'healing'];

			const excludedCategory = itemkeywords.some((keyword) =>
				itemInfo.category.includes(keyword)
			);

			itemInfo.cost = excludedCategory
				? itemInfo.cost
				: Math.round(itemInfo.cost * 46.25);

			// Create an embed with enhanced layout
			const embed = createItemEmbed(interaction, itemInfo);

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('❌ Item Not Found')
				.setDescription(
					`Could not find an item named "${itemName}". Please check the spelling and try again. \n\n Error: ${error}`
				)
				.addFields({
					name: '💡 Tips',
					value:
						'• Use the exact item name\n• Check for typos\n• Example: "potion" or "master-ball"',
				})
				.setTimestamp();

			await interaction.editReply({ embeds: [errorEmbed] });
		}
	},
};
