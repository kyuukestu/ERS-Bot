const { moveEndPoint } = require('../../components/apis/pokeapi.ts');
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
		const moveName = interaction.options.get('move', true).value as string;

		try {
			// Defer the reply to avoid interaction timeouts
			await interaction.deferReply();

			const response = await moveEndPoint(moveName);

			// Parse the response as JSON
			const data: MoveData = response as MoveData;

			// Extract key info
			const name = data.name.toUpperCase();
			const type = data.type.name;
			const accuracy = data.accuracy;
			const effectChance = data.effect_chance;
			const priority = data.priority;
			const power = data.power;
			const damageClass = data.damage_class.name;
			const flavorText = data.flavor_text_entries[0].flavor_text;

			// Create an embed with move details
			const embed = new EmbedBuilder()
				.setTitle(`${name} (${type})`)
				.setDescription(flavorText)
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
					{ name: 'Damage Class', value: damageClass, inline: true },
					{ name: 'Type', value: type, inline: true }
				)
				.setFooter({
					text: `Powered by PokeAPI. Requested by ${interaction.user.username}`,
					iconURL: interaction.user.displayAvatarURL(),
				});

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
