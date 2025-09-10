import {
	EmbedBuilder,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('underground-encounter')
		.setDescription('Rolls an Underground encounter.'),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('Underground encounter');
	},
};
