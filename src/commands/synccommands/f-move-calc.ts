import {
	EmbedBuilder,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { formatUserInput } from '../../components/utility/formatUserInput';
import { MoveData } from '../../components/interface/apiData';
import { moveEndPoint } from '../../components/api/pokeapi';
import { extractMoveInfo } from '../../components/utility/dataExtraction';
import { calculateMoveCost } from '../../components/utility/moveCostCalc.ts';
import { typeColors } from '../../components/ui/colors.ts';
import { moveEmojis } from '../../components/ui/emojis.ts';

export default {
	data: new SlashCommandBuilder()
		.setName('move-cost')
		.setDescription('Calculates the cost of a move.')
		.addStringOption((option: any) =>
			option
				.setName('move')
				.setDescription('Name of the move.')
				.setRequired(true)
		)
		.addNumberOption((option: any) =>
			option
				.setName('secondary-effects')
				.setDescription('Is this an alpha pokemon?')
				.setRequired(false)
		)
		.addNumberOption((option: any) =>
			option
				.setName('stat-changes')
				.setDescription('Enter the pokeball name.')
				.setRequired(false)
		)
		.addNumberOption((option: any) =>
			option
				.setName('field-effects')
				.setDescription('Is this pokemon in the PC box?')
				.setRequired(false)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const moveName = formatUserInput(
			interaction.options.getString('move', true)
		);
		const secEffect = interaction.options.getNumber('secondary-effects');
		const statChanges = interaction.options.getNumber('stat-changes');
		const fieldEffects = interaction.options.getNumber('field-effects');

		try {
			await interaction.deferReply();

			const data: MoveData = await moveEndPoint(moveName);
			const moveInfo = extractMoveInfo(data);

			const cost = calculateMoveCost(
				parseInt(moveInfo.power),
				parseInt(statChanges !== null ? statChanges.toString() : '0'),
				parseInt(secEffect !== null ? secEffect.toString() : '0'),
				parseInt(fieldEffects !== null ? fieldEffects.toString() : '0')
			);

			// Create an embed with enhanced layout
			const embed = new EmbedBuilder()
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
					{ name: '🔋 PP', value: moveInfo.pp, inline: true },
					{ name: 'Fortitude Cost', value: cost.toString(), inline: false },
					{ name: '🎯 Target', value: moveInfo.target, inline: true },
					{ name: '🌍 Generation', value: moveInfo.generation, inline: true },
					{
						name: '📅 Version',
						value:
							moveInfo.flavor_text_ver.charAt(0).toUpperCase() +
							moveInfo.flavor_text_ver.slice(1),
						inline: true,
					}
				)
				.setFooter({
					text: `Requested by ${interaction.user.username} • Powered by PokeAPI`,
					iconURL: interaction.user.displayAvatarURL(),
				})
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] });
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
					{ name: '⚠️ Error', value: error.message }
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
