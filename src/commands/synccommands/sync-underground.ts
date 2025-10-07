import {
	AttachmentBuilder,
	EmbedBuilder,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import path from 'path';
import { underground_draw } from '../../utility/draws/underground-draw';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-rand-underground-encounter')
		.setDescription(
			'Rolls a random encounter for the Sinnoh Grand Underground. (PokeSync)'
		),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();

		const result = underground_draw();
		const filePath = path.join(
			__dirname,
			'../../assets/Grand_Underground_map_BDSP.png'
		);
		const file = new AttachmentBuilder(filePath, {
			name: 'Grand_Underground_map_BDSP.png',
		});

		const resultEmbed = new EmbedBuilder()
			.setTitle('Underground Encounter')
			.setDescription(`You found: ${result}`)
			.setColor(0x0099ff)
			.setImage('attachment://Grand_Underground_map_BDSP.png')
			.setTimestamp(Date.now());

		await interaction.editReply({ embeds: [resultEmbed], files: [file] });
	},
};
