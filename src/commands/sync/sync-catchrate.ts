import {
	EmbedBuilder,
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ComponentType,
	type ButtonInteraction,
	StringSelectMenuBuilder,
	type StringSelectMenuInteraction,
	type SlashCommandIntegerOption,
	type SlashCommandBooleanOption,
	type SlashCommandNumberOption,
	SlashCommandStringOption,
	MessageFlags,
} from 'discord.js';
import { formatUserInput } from '~/utility/formatting/formatUserInput';
import { speciesEndPoint } from '~/api/endpoints';
import { extractSpeciesInfo } from '~/api/dataExtraction/extractSpeciesInfo';
import { calculateCatchRate } from '~/utility/calculators/sync-catchrate-calculator';

interface CatchData {
	catch_roll: number;
	catch_rate: number;
	caught: boolean;
	chance: string;
	pokeball: string;
	pokeball_multi: number;
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
				value: `You used a **${
					catch_data.pokeball
				}** which has a multiplier of **${
					catch_data.pokeball_multi
				}**\n\n. You rolled **${
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

const createBallEmbed = () => {
	const ballEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Special Balls')
		.setDescription('Select the type of ball you want to use.');

	const aestheticBalls = new StringSelectMenuBuilder()
		.setCustomId('aesthetic_balls')
		.setPlaceholder('Aesthetic Special Balls...')
		.addOptions([
			{
				label: 'Safari Ball',
				value: 'safariball',
			},
			{
				label: 'Sport Ball',
				value: 'sportball',
			},
			{
				label: 'Luxury Ball',
				value: 'luxuryball',
			},
			{
				label: 'Premier Ball',
				value: 'premierball',
			},
			{
				label: 'Heal Ball',
				value: 'healball',
			},
			{
				label: 'Cherish Ball',
				value: 'cherishball',
			},
			{
				label: 'Park Ball',
				value: 'parkball',
			},
			{
				label: 'Strange Ball',
				value: 'strangeball',
			},
		]);

	const specialBall = new StringSelectMenuBuilder()
		.setCustomId('special_ball')
		.setPlaceholder('Other Special Balls...')
		.addOptions([
			{
				label: 'Fast Ball',
				value: 'fastball',
			},
			{
				label: 'Level Ball',
				value: 'levelball',
			},
			{
				label: 'Heavy Ball',
				value: 'heavyball',
			},
			{
				label: 'Love Ball',
				value: 'loveball',
			},
			{
				label: 'Moon Ball',
				value: 'moonball',
			},
			{
				label: 'Net Ball',
				value: 'netball',
			},
			{
				label: 'Dive Ball',
				value: 'diveball',
			},
			{
				label: 'Nest Ball',
				value: 'nestball',
			},
			{
				label: 'Repeat Ball',
				value: 'repeatball',
			},
			{
				label: 'Timer Ball',
				value: 'timerball',
			},
			{
				label: 'Dusk Ball',
				value: 'duskball',
			},
			{
				label: 'Quick Ball',
				value: 'quickball',
			},
			{
				label: 'Dream Ball',
				value: 'dreamball',
			},
			{
				label: 'Feather Ball',
				value: 'featherball',
			},
			{
				label: 'Wing Ball',
				value: 'wingball',
			},
			{
				label: 'Jet Ball',
				value: 'jetball',
			},
		]);

	const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		aestheticBalls
	);
	const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		specialBall
	);

	return {
		embeds: [ballEmbed],
		components: [row1, row2],
	};
};

export default {
	data: new SlashCommandBuilder()
		.setName('sync-catch-rate')
		.setDescription('Calculates the catch rate of a pokemon. (PokeSync)')
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('pokemon')
				.setDescription('Enter the Pokémon name.')
				.setRequired(true)
		)
		.addStringOption((option: SlashCommandStringOption) =>
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
					},
					{
						name: 'Ultra Ball (Hisui)',
						value: 'ultraball-hisui',
					},
					{
						name: 'Specialball',
						value: 'specialball',
					}
				)
				.setRequired(true)
		)
		.addNumberOption((option: SlashCommandNumberOption) =>
			option
				.setName('health-rem')
				.setDescription(
					'Enter the health of the pokemon (Percentage Remaining).'
				)
				.setRequired(true)
		)
		.addIntegerOption((option: SlashCommandIntegerOption) =>
			option
				.setName('target-level')
				.setDescription("Enter the Target Pokemon's level (Defaults to 1).")
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(100)
		)
		.addStringOption((option: SlashCommandStringOption) =>
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
		)
		.addIntegerOption((option: SlashCommandIntegerOption) =>
			option
				.setName('user-level')
				.setDescription("Enter the User Pokemon's level (Defaults to 1).")
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(100)
		)
		.addIntegerOption((option: SlashCommandIntegerOption) =>
			option
				.setName('base-speed')
				.setDescription(
					"Enter the target pokemon's base speed (Defaults to 1)."
				)
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(255)
		)
		.addNumberOption((option: SlashCommandNumberOption) =>
			option
				.setName('level')
				.setDescription("Enter the Pokemon's Weight (in KG).")
				.setRequired(false)
				.setMinValue(0)
				.setMaxValue(999)
		)
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('fishing')
				.setDescription('Is this a fishing attempt?')
				.setRequired(false)
		)
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('water')
				.setDescription('Does this Encounter take place in water?')
				.setRequired(false)
		)
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('opposite-gender-and-same-species')
				.setDescription(
					'Does the target pokemon have the opposite gender and is of the same species?'
				)
				.setRequired(false)
		)
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('moonstone-evo')
				.setDescription('Does the target pokemon evolve via moonstone?')
				.setRequired(false)
		)
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('water-or-bug-type')
				.setDescription('Does the target pokemon have a water or bug typing?')
				.setRequired(false)
		)
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('previously-caught')
				.setDescription('Has the target species been caught before?')
				.setRequired(false)
		)
		.addIntegerOption((option: SlashCommandIntegerOption) =>
			option
				.setName('battle-turns')
				.setDescription('Enter the number of turns.')
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(100)
		)
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('night-cave')
				.setDescription('Is it night time or inside a cave?')
				.setRequired(false)
		)

		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('flying')
				.setDescription('Is the target flying? Action not Type.')
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

		const target_level = interaction.options.getInteger('target-level', false);
		const user_level = interaction.options.getInteger('user-level', false);
		const base_speed = interaction.options.getInteger('base-speed', false);
		const weight = interaction.options.getNumber('level', false);
		const fishing = interaction.options.getBoolean('fishing', false);
		const water = interaction.options.getBoolean('water', false);
		const opposite_gender = interaction.options.getBoolean(
			'opposite-gender-and-same-species',
			false
		);
		const moonstone = interaction.options.getBoolean('moonstone-evo', false);
		const water_or_bug = interaction.options.getBoolean(
			'water-or-bug-type',
			false
		);
		const previously_caught = interaction.options.getBoolean(
			'previously-caught',
			false
		);

		const turns = interaction.options.getInteger('battle-turns', false);

		const is_night_or_cave = interaction.options.getBoolean(
			'night-cave',
			false
		);

		const flying = interaction.options.getBoolean('flying', false);

		try {
			await interaction.deferReply();

			const speciesInfo = extractSpeciesInfo(await speciesEndPoint(pokemon));

			let attempts = 1;

			if (pokeball === 'specialball') {
				const message = await interaction.editReply(createBallEmbed());

				const collector = message.createMessageComponentCollector({
					componentType: ComponentType.StringSelect,
					time: 60_000,
				});

				collector.on(
					'collect',
					async (selectInteraction: StringSelectMenuInteraction) => {
						await selectInteraction.deferUpdate();

						const selectedValue = selectInteraction.values[0];

						if (selectInteraction.customId === 'aesthetic_balls') {
							let catch_data = calculateCatchRate(
								speciesInfo.capture_rate,
								selectedValue,
								status,
								health,
								target_level,
								user_level,
								base_speed,
								weight,
								fishing,
								water,
								opposite_gender,
								moonstone,
								water_or_bug,
								previously_caught,
								turns,
								is_night_or_cave,
								flying
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
													content:
														'Only the original user can use this button!',
													flags: MessageFlags.Ephemeral,
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

											const updatedEmbed = createEmbed(
												pokemon,
												catch_data,
												attempts
											);

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
						} else if (selectInteraction.customId === 'special_ball') {
							let catch_data = calculateCatchRate(
								speciesInfo.capture_rate,
								selectedValue,
								status,
								health,
								target_level,
								user_level,
								base_speed,
								weight,
								fishing,
								water,
								opposite_gender,
								moonstone,
								water_or_bug,
								previously_caught,
								turns,
								is_night_or_cave,
								flying
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
													content:
														'Only the original user can use this button!',
													flags: MessageFlags.Ephemeral,
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

											const updatedEmbed = createEmbed(
												pokemon,
												catch_data,
												attempts
											);

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
						}
					}
				);
			} else {
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
										flags: MessageFlags.Ephemeral,
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
