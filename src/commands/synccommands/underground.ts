import {
	EmbedBuilder,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { underground_draw } from '../../components/utility/undeground-draw';

export default {
	data: new SlashCommandBuilder()
		.setName('underground-encounter')
		.setDescription('Rolls an Underground encounter.'),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();

		const result = underground_draw();

		const resultEmbed = new EmbedBuilder()
			.setTitle('Underground Encounter')
			.setDescription(`You found: ${result}`)
			.setColor(0x0099ff)
			.setImage('../../assests/Grand_Underground_map_BDSP.png')
			.setTimestamp(Date.now());

		await interaction.editReply({ embeds: [resultEmbed] });
	},
};
