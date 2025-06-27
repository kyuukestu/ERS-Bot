const { itemEndPoint } = require('../../components/api/pokeapi.ts');
const {
	formatUserInput,
} = require('../../components/utility/formatUserInput.ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { ItemData } from '../../components/interface/ItemData.ts';

// Item category colors for aesthetic enhancement
const categoryColors: { [key: string]: number } = {
	medicine: 0x4caf50,
	held_item: 0x2196f3,
	berry: 0x8bc34a,
	tm: 0xff9800,
	other: 0x9e9e9e,
};

// Emojis for visual appeal
const itemEmojis: { [key: string]: string } = {
	medicine: '💊',
	held_item: '🎒',
	berry: '🍇',
	tm: '📜',
	other: '❓',
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('itemdex')
		.setDescription('Search for an item by name and get its information.')
		.addStringOption((option: any) =>
			option
				.setName('item')
				.setDescription('Enter the item name.')
				.setRequired(true)
		),

	async execute(interaction: CommandInteraction) {
		const itemName = formatUserInput(
			interaction.options.get('item', true).value as string
		);

		try {
			await interaction.deferReply();

			const response = await itemEndPoint(itemName);
			const data: ItemData = response as ItemData;

			// Extract key info with fallback values
			const name = data.name
				.split('-')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ');
			const category = data.category?.name || 'other';
			const cost = data.cost || 0;
			const effect =
				data.effect_entries
					.filter((entry) => entry.language.name === 'en')
					.pop()?.effect || 'No English description available';
			const flavorText =
				data.flavor_text_entries
					.filter((entry) => entry.language.name === 'en')
					.pop()?.text || 'No English description available';
			const flavorTextVer =
				data.flavor_text_entries.filter((ft) => ft.language.name === 'en').pop()
					?.version_group.name || 'Unknown';
			const sprite = data.sprites.default || '';
			const flingPower = data.fling_power || 0;
			const flingEffect = data.fling_effect?.name
				? data.fling_effect.name
						.split('-')
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' ')
				: 'None';

			// Create an embed with enhanced layout
			const embed = new EmbedBuilder()
				.setColor(categoryColors[category] || categoryColors['other'])
				.setTitle(`${itemEmojis[category] || '❓'} **${name}**`)
				.setDescription(flavorText.replace(/\r?\n|\r/g, ' '))
				.setThumbnail(sprite)
				.addFields(
					{
						name: '📌 Category',
						value: category.charAt(0).toUpperCase() + category.slice(1),
						inline: true,
					},
					{
						name: '💰 Cost',
						value: cost.toLocaleString() + ' Pokédollars',
						inline: true,
					},
					{
						name: '⚡ Fling Power',
						value: flingPower.toString(),
						inline: true,
					},
					{
						name: '🎯 Fling Effect',
						value: flingEffect,
						inline: true,
					},
					{
						name: '📝 Effect',
						value: effect.replace(/\r?\n|\r/g, ' '),
						inline: false,
					},
					{
						name: '📅 Version',
						value: flavorTextVer,
						inline: false,
					}
				)
				.setFooter({
					text: `Requested by ${interaction.user.username}`,
					iconURL: interaction.user.displayAvatarURL(),
				})
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('❌ Item Not Found')
				.setDescription(
					`Could not find an item named "${itemName}". Please check the spelling and try again. Error: ${error}`
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
