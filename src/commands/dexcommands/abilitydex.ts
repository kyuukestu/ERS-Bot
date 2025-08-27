import {
	EmbedBuilder,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { abilityEndPoint } from '../../components/api/pokeapi.ts';
import { formatUserInput } from '../../components/utility/formatUserInput.ts';
import { extractAbilityInfo } from '../../components/utility/dataExtraction.ts';
import type { AbilityData } from '../../components/interface/apiData.ts';

export default {
	data: new SlashCommandBuilder()
		.setName('abilitydex')
		.setDescription(
			'Provides information about a Pokémon ability, e.g. Speed Boost, Immunity, Huge Power, etc.'
		)
		.addStringOption((option) =>
			option
				.setName('ability')
				.setDescription("The Ability's name.")
				.setRequired(true)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		// Use the newer getString method instead of get
		const abilityName = formatUserInput(
			interaction.options.getString('ability', true)
		);

		try {
			await interaction.deferReply();

			const response = await abilityEndPoint(abilityName);
			const data: AbilityData = response as AbilityData;
			const abilityInfo = extractAbilityInfo(data);

			// Create an embed with enhanced layout
			const embed = new EmbedBuilder()
				.setColor(abilityInfo.color)
				.setTitle(`${abilityInfo.emoji} **${abilityInfo.name}**`)
				.setDescription(abilityInfo.effect.replace(/\r?\n|\r/g, ' '))
				.addFields(
					{
						name: '📌 Generation',
						value: abilityInfo.generation,
						inline: true,
					},
					{
						name: '🎯 Effect Chance',
						value: abilityInfo.effectChance,
						inline: true,
					},
					{
						name: '🐾 Pokémon',
						value: abilityInfo.pokemon || 'N/A',
						inline: false,
					}
				)
				.setFooter({
					text: `Requested by ${interaction.user.username} • Powered by PokeAPI`,
					iconURL: interaction.user.displayAvatarURL(),
				})
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			console.error('Error fetching ability data:', error);

			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('❌ Ability Not Found')
				.setDescription(
					`Could not find an ability named "${abilityName}". Please check the spelling and try again.`
				)
				.addFields({
					name: '💡 Tips',
					value:
						'• Use the exact ability name\n• Check for typos\n• Example: "overgrow" or "drizzle"',
				})
				.setTimestamp();

			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({ embeds: [errorEmbed] });
			} else {
				await interaction.reply({ embeds: [errorEmbed] });
			}
		}
	},
};
