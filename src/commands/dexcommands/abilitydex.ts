const { abilityEndPoint } = require('../../components/api/PokeApi.ts');
const {
	formatUserInput,
} = require('../../components/utility/formatUserInput.ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { AbilityData } from '../../components/interface/AbilityData.ts';

// Color scheme for aesthetic enhancement (default based on ability utility)
const abilityColors: { [key: string]: number } = {
	offensive: 0xff4444,
	defensive: 0x44ff44,
	utility: 0x4444ff,
	other: 0xcccccc,
};

// Emojis for visual appeal
const abilityEmojis: { [key: string]: string } = {
	offensive: '⚔️',
	defensive: '🛡️',
	utility: '🔧',
	other: '❓',
};

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
			await interaction.deferReply();

			const response = await abilityEndPoint(abilityName);
			const data: AbilityData = response as AbilityData;

			// Extract key info with fallback values from PokeAPI ability endpoint
			const name = data.name
				.split('-')
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ');
			const effect =
				data.effect_entries
					.filter((e) => e.language.name === 'en')
					.map((e) => e.effect)
					.join('\n') || 'No English description available';
			const generation =
				data.generation?.name.replace('generation-', '') || 'Unknown'; // Generation from PokeAPI
			const pokemon =
				data.pokemon
					.slice(0, 3)
					.map(
						(p) =>
							p.pokemon.name.charAt(0).toUpperCase() + p.pokemon.name.slice(1)
					)
					.join(', ') + (data.pokemon.length > 3 ? '...' : ''); // Top 3 Pokémon with ellipsis if more
			const effectChance =
				data.effect_entries.filter((e) => e.language.name === 'en').pop()
					?.effect_chance || 'N/A'; // Effect chance if available

			// Determine ability category for color and emoji (simplified categorization)
			const category = data.effect_entries.some(
				(e) => e.effect.includes('attack') || e.effect.includes('damage')
			)
				? 'offensive'
				: data.effect_entries.some(
						(e) => e.effect.includes('defense') || e.effect.includes('reduce')
				  )
				? 'defensive'
				: data.effect_entries.some(
						(e) => e.effect.includes('status') || e.effect.includes('boost')
				  )
				? 'utility'
				: 'other';
			const color = abilityColors[category] || abilityColors['other'];
			const emoji = abilityEmojis[category] || abilityEmojis['other'];

			// Create an embed with enhanced layout
			const embed = new EmbedBuilder()
				.setColor(color)
				.setTitle(`${emoji} **${name}**`)
				.setDescription(effect.replace(/\r?\n|\r/g, ' '))
				.addFields(
					{ name: '📌 Generation', value: generation, inline: true },
					{ name: '🎯 Effect Chance', value: effectChance, inline: true },
					{ name: '🐾 Pokémon', value: pokemon || 'N/A', inline: false }
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
