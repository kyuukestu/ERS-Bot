import {
	EmbedBuilder,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { abilityEndPoint } from '../../utility/api/pokeapi.ts';
import { formatUserInput } from '../../utility/formatting/formatUserInput.ts';
import { extractAbilityInfo } from '../../utility/dataExtraction/extractAbilityInfo.ts';
import z from 'zod';

const abilitySchema = z.object({
	name: z.string(),
	color: z.number(),
	emoji: z.string(),
	generation: z.string(),
	effect: z.string(),
	effectChance: z.string(),
	pokemon: z.string().optional(),
});

type AbilityInfo = z.infer<typeof abilitySchema>;

const createAbilityEmbed = (
	interaction: ChatInputCommandInteraction,
	abilityInfo: AbilityInfo
): EmbedBuilder => {
	return new EmbedBuilder()
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
};

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
		const abilityName = formatUserInput(
			interaction.options.getString('ability', true)
		);

		try {
			await interaction.deferReply();

			const abilityInfo = extractAbilityInfo(
				await abilityEndPoint(abilityName)
			);

			const embed = createAbilityEmbed(interaction, abilityInfo);

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
