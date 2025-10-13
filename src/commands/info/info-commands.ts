import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('info-commands')
		.setDescription('Provides a list of commands'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('Under Construction');
	},
};
