const { moveEndPoint } = require('../../components/api/pokeapi.ts');
const { formatUserInput } = require('../utility/formatUserInput.ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { MoveData } from '../../components/interface/moveData.ts';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('attackdex')
		.setDescription('Search for a move by name and get its information.')
		.addStringOption((option: any) =>
			option
				.setName('move')
				.setDescription('Enter the move name.')
				.setRequired(true)
		),

	async execute(interaction: CommandInteraction) {
		const moveName = formatUserInput(
			interaction.options.get('move', true).value as string
		);

		try {
			// Defer the reply to avoid interaction timeouts
			await interaction.deferReply();

			const response = await moveEndPoint(moveName);

			// Parse the response as JSON
			const data: MoveData = response as MoveData;

			// Extract key info
			const name = data.name;
			const type = data.type.name;
			const accuracy = data.accuracy;
			const effectChance = data.effect_chance;
			const priority = data.priority;
			const power = data.power;
			const damageClass = data.damage_class.name;
			// const flavorText = data.flavor_text_entries[0].flavor_text;
			const flavorText =
				data.flavor_text_entries
					.filter((ft) => ft.language.name === 'en') // Filter English entries
					.pop()?.flavor_text || // Get last element
				'No English description available';

			const flavorTextVer =
				data.flavor_text_entries.filter((ft) => ft.language.name === 'en').pop()
					?.version_group.name || 'No English version';

			// Create an embed with move details
			const embed = embedFormat(
				name,
				type,
				flavorText,
				flavorTextVer,
				accuracy,
				effectChance,
				priority,
				power,
				damageClass,
				interaction
			);

			// Edit the deferred reply with the embed
			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error('Error fetching move data:', error);

			// Check if the interaction has already been acknowledged
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(
					`❌ Error: Move "${moveName}" not found. Please check the name and try again.`
				);
			} else {
				await interaction.reply(
					`❌ Error: Move "${moveName}" not found. Please check the name and try again.`
				);
			}
		}
	},
};

function embedFormat(
	name: string,
	type: string,
	flavorText: string,
	flavorTextVer: string,
	accuracy: number | undefined,
	effectChance: number | undefined,
	priority: number,
	power: number | undefined,
	damageClass: string,
	interaction: any
) {
	const regExNewLine = /\r?\n|\r/g;

	const fName = name
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
	const fType = type.charAt(0).toUpperCase() + type.slice(1);
	const fFlavorText = flavorText.replace(regExNewLine, ' ');

	return new EmbedBuilder()
		.setTitle(`${fName} (${fType})`)
		.setDescription(fFlavorText)
		.addFields(
			{
				name: 'Accuracy',
				value: accuracy ? `${accuracy}%` : 'N/A',
				inline: true,
			},
			{
				name: 'Effect Chance',
				value: effectChance ? `${effectChance}%` : 'N/A',
				inline: true,
			},
			{ name: 'Priority', value: priority.toString(), inline: true },
			{
				name: 'Power',
				value: power ? power.toString() : 'N/A',
				inline: true,
			},
			{ name: 'Damage Class', value: damageClass.toUpperCase(), inline: true },
			{ name: 'Type', value: fType, inline: true },
			{
				name: 'Version',
				value: flavorTextVer.charAt(0).toUpperCase() + flavorTextVer.slice(1),
				inline: true,
			}
		)
		.setFooter({
			text: `Powered by PokeAPI. Requested by ${interaction.user.username}`,
			iconURL: interaction.user.displayAvatarURL(),
		});
}
