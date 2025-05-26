const { abilityEndPoint } = require('../../components/api/PokeApi.ts');
const {
	formatUserInput,
} = require('../../components/utility/formatUserInput.ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { AbilityData } from '../../components/interface/AbilityData.ts';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('abilitydex')
		.setDescription('Get information about a Pokémon ability.')
		.addStringOption((option: any) =>
			option
				.setName('ability')
				.setDescription('The name of the ability.')
				.setRequired(true)
		),

	async execute(interaction: CommandInteraction) {
		const abilityName = formatUserInput(
			interaction.options.get('ability', true).value as string
		);

		try {
			// Defer the reply to avoid interaction timeouts
			await interaction.deferReply();

			const response = await abilityEndPoint(abilityName);

			const data: AbilityData = response as AbilityData;

			const name = data.name.toUpperCase();
			const description = data.effect_entries
				.filter((e) => e.language.name === 'en')
				.map((e) => e.effect)
				.join('\n');

			const embed = new EmbedBuilder()
				.setColor('#FFCC00') // Set the embed color
				.setTitle(`📖 Ability: ${name}`)
				.setDescription(description);

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			// Check if the interaction has already been acknowledged
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(
					`❌ Error: Ability "${abilityName}" not found. Please check the name and try again.\n${error}`
				);
			} else {
				await interaction.reply(
					`❌ Error: Ability "${abilityName}" not found. Please check the name and try again.\n${error}`
				);
			}
		}
	},
};
