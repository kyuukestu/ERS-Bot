const { itemEndPoint } = require('../../components/api/pokeapi.ts');
const {
	formatUserInput,
} = require('../../components/utility/formatUserInput.ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { ItemData } from '../../components/interface/ItemData.ts';

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
			// Defer the reply to avoid interaction timeouts
			await interaction.deferReply();

			const response = await itemEndPoint(itemName);

			// Parse the response as JSON
			const data: ItemData = response as ItemData;

			// Extract key info
			const name = data.name;

			let flingPower;
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
					?.version_group.name || 'No English version';
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
			const embed = formatEmbed(
				name,
				flavorText,
				flavorTextVer,
				flingPower,
				flingEffect,
				effect,
				sprite
			);

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			await interaction.editReply(`Error: ${error}`);
		}
	},
};

function formatEmbed(
	name: string,
	flavorText: string,
	flavorTextVer: string,
	flingPower: number,
	flingEffect: string,
	effect: string,
	sprite: string
) {
	const regExNewLine = /\r?\n|\r/g;

	const fName = name
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
	const fFlavorText = flavorText.replace(regExNewLine, ' ');
	const fEffect = effect.replace(regExNewLine, ' ');
	const fFlingEffect = flingEffect
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	return new EmbedBuilder()
		.setTitle(fName)
		.setDescription(fFlavorText)
		.addFields(
			{
				name: 'Fling Power',
				value: flingPower.toString(),
				inline: true,
			},
			{
				name: 'Fling Effect',
				value: fFlingEffect,
				inline: true,
			},
			{
				name: 'Effect',
				value: fEffect,
				inline: false,
			},
			{
				name: 'Version',
				value: flavorTextVer,
				inline: false,
			}
		)
		.setThumbnail(sprite);
}
