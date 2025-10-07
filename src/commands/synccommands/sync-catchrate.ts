import {
	EmbedBuilder,
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ComponentType,
	type ButtonInteraction,
} from 'discord.js';
import { formatUserInput } from '../../utility/formatting/formatUserInput';
import { speciesEndPoint } from '../../utility/api/pokeapi';
import { extractSpeciesInfo } from '../../utility/dataExtraction/extractSpeciesInfo';
import { calculateCatchRate } from '../../utility/calculators/catchRateCalculator';

interface CatchData {
	catch_roll: number;
	catch_rate: number;
	caught: boolean;
	chance: string;
}
const createEmbed = (
	pokemon: string,
	catch_data: CatchData,
	attempts: number
): EmbedBuilder => {
	return new EmbedBuilder()
		.setColor(catch_data.caught ? 0x00ff00 : 0xff0000)
		.setTitle(
			`${
				catch_data.caught
					? `You caught ${pokemon}!`
					: `Aww, ${pokemon} just got away!`
			}`
		)
		.addFields(
			{
				name: 'Attempts',
				value: attempts.toString(),
				inline: true,
			},
			{
				name: 'Details',
				value: `You rolled **${
					catch_data.catch_roll
				}** and the threshold is **${
					catch_data.catch_rate
				}**. Your chance of catching this pokemon ${
					catch_data.caught ? 'was' : 'is'
				} **${catch_data.chance}%**.`,
				inline: false,
			}
		)
		.setTimestamp();
};

const createActionRow = (): ActionRowBuilder<ButtonBuilder> => {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('try_again')
			.setLabel('Try Again')
			.setStyle(ButtonStyle.Secondary)
	);
};

export default {
	data: new SlashCommandBuilder()
		.setName('sync-catch-rate')
		.setDescription('Calculates the catch rate of a pokemon. (PokeSync)')
		.addStringOption((option) =>
			option
				.setName('pokemon')
				.setDescription('Enter the Pokémon name.')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('pokeball')
				.setDescription('Enter the Type of Pokeball.')
				.addChoices(
					{
						name: 'Pokeball',
						value: 'pokeball',
					},
					{
						name: 'Greatball',
						value: 'greatball',
					},
					{
						name: 'Ultra Ball',
						value: 'ultraball',
					}
				)
				.setRequired(true)
		)

		.addNumberOption((option) =>
			option
				.setName('health-rem')
				.setDescription(
					'Enter the health of the pokemon (Percentage Remaining).'
				)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('status-effect')
				.setDescription('Enter the Status Effect name.')
				.addChoices(
					{
						name: 'Healthy',
						value: 'healthy',
					},
					{
						name: 'Burn',
						value: 'burn',
					},
					{
						name: 'Freeze',
						value: 'freeze',
					},
					{
						name: 'Paralysis',
						value: 'paralysis',
					},
					{
						name: 'Poison',
						value: 'poison',
					},
					{
						name: 'Sleep',
						value: 'sleep',
					}
				)
				.setRequired(false)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const pokemon = formatUserInput(
			interaction.options.getString('pokemon', true)
		);
		const pokeball = formatUserInput(
			interaction.options.getString('pokeball', true)
		);
		const status = formatUserInput(
			interaction.options.getString('status-effect', false) || undefined
		);
		const health = interaction.options.getNumber('health-rem', true);

		try {
			await interaction.deferReply();

			const speciesInfo = extractSpeciesInfo(await speciesEndPoint(pokemon));

			let attempts = 1;
			let catch_data = calculateCatchRate(
				speciesInfo.capture_rate,
				pokeball,
				status,
				health
			);

			const embed = createEmbed(pokemon, catch_data, attempts);
			const action_row = createActionRow();

			let response;
			if (catch_data.caught) {
				response = await interaction.editReply({
					embeds: [embed],
				});
			} else {
				response = await interaction.editReply({
					embeds: [embed],
					components: [action_row],
				});
			}

			// Set up button collector if pokemon wasn't caught
			if (!catch_data.caught) {
				const collector = response.createMessageComponentCollector({
					componentType: ComponentType.Button,
					time: 300_000, // 5 minutes timeout
				});

				collector.on(
					'collect',
					async (buttonInteraction: ButtonInteraction) => {
						if (buttonInteraction.customId === 'try_again') {
							// Only allow the original user to use the button
							if (buttonInteraction.user.id !== interaction.user.id) {
								await buttonInteraction.reply({
									content: 'Only the original user can use this button!',
									ephemeral: true,
								});
								return;
							}

							attempts++;
							catch_data = calculateCatchRate(
								speciesInfo.capture_rate,
								pokeball,
								status,
								health
							);

							const updatedEmbed = createEmbed(pokemon, catch_data, attempts);

							if (catch_data.caught) {
								// Pokemon caught - remove the button
								await buttonInteraction.update({
									embeds: [updatedEmbed],
									components: [],
								});
								collector.stop('caught');
							} else {
								// Still not caught - update embed but keep button
								await buttonInteraction.update({
									embeds: [updatedEmbed],
									components: [action_row],
								});
							}
						}
					}
				);

				collector.on('end', (collected, reason) => {
					// If collector ends due to timeout (not because pokemon was caught)
					if (reason === 'time') {
						// Disable the button
						const disabledRow =
							new ActionRowBuilder<ButtonBuilder>().addComponents(
								new ButtonBuilder()
									.setCustomId('try_again')
									.setLabel('Try Again')
									.setStyle(ButtonStyle.Secondary)
									.setDisabled(true)
							);

						interaction
							.editReply({
								components: [disabledRow],
							})
							.catch(console.error);
					}
				});
			}
		} catch (err) {
			console.error(err);

			// Handle error response
			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('Error')
				.setDescription('An error occurred while trying to catch the Pokemon.')
				.setTimestamp();

			await interaction
				.editReply({
					embeds: [errorEmbed],
					components: [],
				})
				.catch(console.error);
		}
	},
};
