const { itemEndPoint } = require('../../components/api/pokeapi.ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { ItemData } from '../../components/interface/itemData.ts';

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
		const itemName = interaction.options.get('item', true).value as string;

		try {
			// Defer the reply to avoid interaction timeouts
			await interaction.deferReply();

			const response = await itemEndPoint(itemName);

			// Parse the response as JSON
			const data: ItemData = response as ItemData;

			// Extract key info
			const name = data.name.toUpperCase();
			let flingPower;
			const effect = data.effect_entries[0].effect;
			const flavorText = data.flavor_text_entries[0].text;
			const sprite = data.sprites.default;
			let flingEffect;

			// Check if fling power is null
			if (data?.fling_power) {
				flingPower = data.fling_power;
			} else {
				flingPower = 0;
			}

			// Check if fling effect is null
			if (data?.fling_effect?.name) {
				flingEffect = data.fling_effect.name;
			} else {
				flingEffect = 'None';
			}

			// Create an embed with item details
			const embed = new EmbedBuilder()
				.setTitle(name)
				.setDescription(flavorText)
				.addFields(
					{
						name: 'Fling Power',
						value: flingPower.toString(),
						inline: true,
					},
					{
						name: 'Fling Effect',
						value: flingEffect,
						inline: true,
					},
					{
						name: 'Effect',
						value: effect,
						inline: false,
					},
					{
						name: 'Flavor Text',
						value: flavorText,
						inline: false,
					}
				)
				.setThumbnail(sprite);

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			await interaction.editReply(`Error: ${error}`);
		}
	},
};
