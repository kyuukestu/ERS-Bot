import {
	EmbedBuilder,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandNumberOption,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { formatUserInput } from '../../utility/formatting/formatUserInput';
import { moveEndPoint } from '../../utility/api/pokeapi';
import { extractMoveInfo } from '../../utility/dataExtraction/extractMoveInfo';
import { calculateMovePrice } from '../../utility/movePriceCalc';
import { formatCurrency } from '../../utility/formatting/formatCurrency';
import { typeColors } from '../../ui/colors';
import { moveEmojis } from '../../ui/emojis';

export default {
	data: new SlashCommandBuilder()
		.setName('calculate-tr-price')
		.setDescription(
			'Calculates the price to purchase a move from the PokeMart.'
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('move-name')
				.setDescription('Name of the move.')
				.setRequired(true)
		)
		.addNumberOption((option: SlashCommandNumberOption) =>
			option
				.setName('sec-override')
				.setDescription(
					'Does this move have a secondary effect? e.g. burn, freeze, increase crit. +1/effect.'
				)
				.setRequired(false)
		)
		.addNumberOption((option: SlashCommandNumberOption) =>
			option
				.setName('stat-override')
				.setDescription(
					'Does this move effect stat changes? Positive for user, negative for foe. +1/boost.'
				)
				.setRequired(false)
		)
		.addNumberOption((option: SlashCommandNumberOption) =>
			option
				.setName('field-override')
				.setDescription(
					'Does this move have a field effect? e.g. Trick Room, sets Hazards, etc.'
				)
				.setRequired(false)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const moveName = formatUserInput(
			interaction.options.getString('move-name', true)
		);
		const secOverride = interaction.options.getNumber('sec-override');
		const statOverride = interaction.options.getNumber('stat-override');
		const fieldOverride = interaction.options.getNumber('field-override');

		try {
			await interaction.deferReply();

			// const data: MoveData = await moveEndPoint(moveName);
			const moveInfo = extractMoveInfo(await moveEndPoint(moveName));
			const move = moveInfo;

			let statChanges = 0;

			if (move.stat_changes?.length) {
				move.stat_changes.forEach((s: any) => {
					// Positive changes are always buffs → charge
					if (s.change > 0) {
						statChanges += s.change;
					}
					// Negative changes may apply to opponent or self
					else if (s.change < 0) {
						const effectText = move.effect_entries
							.filter((e: any) => e.language.name === 'en')
							.map((e: any) => e.effect.toLowerCase())
							.join(' ');

						// If the effect text implies "user" gets the debuff → ignore
						if (
							effectText.includes('user') ||
							effectText.includes('the user')
						) {
							// self-nerf → no cost
						} else {
							// otherwise assume it's a debuff on opponent
							statChanges += Math.abs(s.change);
						}
					}
				});
			}

			let secondaryEffects = 0;

			// Perfect Accuracy Damaging moves count as secondary effects.
			if (
				moveInfo.damage_class == 'special' ||
				moveInfo.damage_class == 'physical'
			) {
				if (moveInfo.accuracy == 'N/A') secondaryEffects++;
			}

			// Priority moves count as secondary effects
			if (parseInt(moveInfo.priority) > 0) secondaryEffects++;

			if (moveInfo.meta) {
				if (moveInfo.meta.ailment_chance > 0) secondaryEffects++;
				if (moveInfo.meta.flinch_chance > 0) secondaryEffects++;
				if (moveInfo.meta.crit_rate > 0) secondaryEffects++;
				if (moveInfo.meta.drain !== 0) secondaryEffects++;
				if (moveInfo.meta.healing !== 0) secondaryEffects++;
			}

			let field_effect_count = 0;
			if (moveInfo.effect_entries) {
				const effectText = moveInfo.effect_entries
					.filter((e) => e.language.name === 'en')
					.map((e) => e.effect.toLowerCase())
					.join(' ');

				const fieldKeywords = [
					'weather',
					'terrain',
					'trick room',
					'gravity',
					'reflect',
					'light screen',
					'tailwind',
					'room',
				];

				fieldKeywords.forEach((keyword) => {
					if (effectText.includes(keyword)) field_effect_count++;
				});
			}

			const cost = calculateMovePrice(
				parseInt(moveInfo.power) || 0,
				statOverride ? statOverride : statChanges,
				secOverride ? secOverride : secondaryEffects,
				fieldOverride ? fieldOverride : field_effect_count
			);

			const costEmbed = new EmbedBuilder()
				.setColor(typeColors[moveInfo.type] || typeColors['normal'])
				.setTitle(
					`${moveEmojis[moveInfo.damage_class] || '❓'} **${moveInfo.name}**`
				)
				.setDescription(moveInfo.flavor_text.replace(/\r?\n|\r/g, ' '))
				.addFields(
					{
						name: '📌 Type',
						value:
							moveInfo.type.charAt(0).toUpperCase() + moveInfo.type.slice(1),
						inline: true,
					},
					{
						name: '🏹 Damage Class',
						value:
							moveInfo.damage_class.charAt(0).toUpperCase() +
							moveInfo.damage_class.slice(1),
						inline: true,
					},
					{ name: '💪 Power', value: moveInfo.power, inline: true },
					{ name: '🎯 Accuracy', value: moveInfo.accuracy, inline: true },
					{
						name: '🎲 Effect Chance',
						value: moveInfo.effect_chance,
						inline: true,
					},
					{ name: '⏱️ Priority', value: moveInfo.priority, inline: true },
					{ name: 'Price', value: formatCurrency(cost), inline: false },
					{ name: '🎯 Target', value: moveInfo.target, inline: true },
					{ name: '🌍 Generation', value: moveInfo.generation, inline: true },
					{
						name: '📅 Version',
						value:
							moveInfo.flavor_text_ver.charAt(0).toUpperCase() +
							moveInfo.flavor_text_ver.slice(1),
						inline: true,
					},
					{
						name: 'Debugging',
						value: `Stat Changes: ${statChanges}\nSecondary Effects: ${secondaryEffects}\nField Effects: ${field_effect_count}`,
					}
				);

			await interaction.editReply({ embeds: [costEmbed] });
		} catch (error) {
			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('❌ Move Not Found')
				.setDescription(
					`Could not find a move named "${moveName}". Please check the spelling and try again.`
				)
				.addFields(
					{
						name: '💡 Tips',
						value:
							'• Use the exact move name\n• Check for typos\n• Example: "tackle" or "hyper-beam"',
					},
					{
						name: '⚠️ Error',
						value: error instanceof Error ? error.message : String(error),
					}
				)
				.setTimestamp();

			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({ embeds: [errorEmbed] });
			} else {
				await interaction.reply({ embeds: [errorEmbed] });
			}
		}
	},
};
