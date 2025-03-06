const { MoveClient } = require('pokenode-ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
import type { CommandInteraction } from 'discord.js';
const { EmbedBuilder } = require('discord.js');
const { fetch } = require('node-fetch');

// Define the structure of the move data
interface MoveData {
	name: string;
	accuracy?: number;
	effect_chance?: number;
	priority: number;
	power?: number;
	damage_class: { name: string };
	type: { name: string };
	flavor_text_entries: { flavor_text: string }[];
}

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

			// Format the move name (lowercase, replace spaces with hyphens, remove apostrophes)
			const formattedMoveName = moveName
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/'/g, '');

			// Fetch move data from the API
			// const data: MoveData = await api.getMoveByName(moveName.toLowerCase());
			const response = await fetch(
				`https://pokeapi.co/api/v2/move/${formattedMoveName}`
			);

			if (!response.ok) {
				throw new Error(`Move "${moveName}" not found.`);
			}

			// Parse the response as JSON
			const data: MoveData = (await response.json()) as MoveData;

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
					text: `Powered by Pokenode. Requested by ${interaction.user.username}`,
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
