import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	type SlashCommandIntegerOption,
} from 'discord.js';
import {
	calculateEnergyPool,
	type Rank,
	type SubRank,
} from '../../utility/calculators/sync-rank-calculator';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-fortitude-pool')
		.setDescription('Calculate your Fortitude Pool (PokeSync).')
		.addStringOption((option) =>
			option
				.setName('rank')
				.setDescription('Your current rank.')
				.setRequired(true)
				.addChoices(
					{
						name: 'Bronze',
						value: 'Bronze',
					},
					{
						name: 'Silver',
						value: 'Silver',
					},
					{
						name: 'Gold',
						value: 'Gold',
					},
					{
						name: 'Platinum',
						value: 'Platinum',
					},
					{
						name: 'Master',
						value: 'Master',
					},
					{
						name: 'High Master',
						value: 'High Master',
					},
					{
						name: 'Grand Master',
						value: 'Grand Master',
					},
					{
						name: 'Legendary',
						value: 'Legendary',
					}
				)
		)
		.addIntegerOption((option: SlashCommandIntegerOption) =>
			option
				.setName('sub-rank')
				.setRequired(true)
				.setDescription('The amount of energy you want to sync.')
				.setMinValue(1)
				.setMaxValue(5)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const rank: Rank = interaction.options.getString('rank') as Rank;
		const subrank: SubRank = interaction.options.getInteger(
			'sub-rank'
		) as SubRank;
		try {
			await interaction.deferReply();

			const result = await calculateEnergyPool(rank, subrank);

			await interaction.editReply(
				`${rank}-${subrank} \nFortitude Pool: ${result}`
			);
		} catch (error) {
			console.error(`Error executing /sync-fortitude-pool: \n\n ${error}`);
		}
	},
};
