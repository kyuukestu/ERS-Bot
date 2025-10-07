import {
	EmbedBuilder,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { getRandomItem } from '../../utility/draws/pickup-draws';

export default {
	data: new SlashCommandBuilder()
		.setName('pick-up-draw')
		.setDescription('Rolls a Pick Up draw.')
		.addIntegerOption((option) =>
			option
				.setName('level')
				.setDescription('Level of the Pokemon')
				.setRequired(true)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const level = interaction.options.getInteger('level', true);

		await interaction.deferReply();

		const result = getRandomItem(level);

		const resultEmbed = new EmbedBuilder()
			.setTitle('Pick Up Draw: Lv. ' + level)
			.setDescription(`${result?.message}`)
			.setColor(result?.obtained ? 0x228b22 : 0xff0000);

		await interaction.editReply({ embeds: [resultEmbed] });
	},
};
