/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculate, Pokemon, Move, type GenerationNum } from '@smogon/calc';
import {
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	ActionRowBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ButtonInteraction,
	StringSelectMenuInteraction,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	MessageFlags,
} from 'discord.js';

// Store user selections
interface UserSelections {
	generation: string;
	move: string;
	format: string;
	pokemon: {
		name: string;
		level: number;
		ability: string;
		nature: string;
		item: string;
		evs: {
			hp: number;
			atk: number;
			def: number;
			spa: number;
			spd: number;
			spe: number;
		};
		boosts: {
			hp: number;
			atk: number;
			def: number;
			spa: number;
			spd: number;
			spe: number;
		};
	}[];
}

const introReply = (stepIndex: number) => {
	const introEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Damage Calculator')
		.setDescription('Please follow the steps to perform a damage calculation.');

	return {
		embeds: [introEmbed],
		components: [handleButtons(stepIndex)],
	};
};

const genReply = (stepIndex: number, selectedGeneration?: string) => {
	const genSelectMenu = new StringSelectMenuBuilder()
		.setCustomId('generation')
		.setPlaceholder(
			selectedGeneration
				? `Selected: Gen ${selectedGeneration}`
				: 'Select a generation'
		)
		.addOptions(
			{ label: 'Gen 1 (RBY)', value: '1' },
			{ label: 'Gen 2 (GSC)', value: '2' },
			{ label: 'Gen 3 (RSE)', value: '3' },
			{ label: 'Gen 4 (DPPt)', value: '4' },
			{ label: 'Gen 5 (BW-B2W2)', value: '5' },
			{ label: 'Gen 6 (XY)', value: '6' },
			{ label: 'Gen 7 (SM-USUM)', value: '7' },
			{ label: 'Gen 8 (SwSh)', value: '8' },
			{ label: 'Gen 9 (SV)', value: '9' }
		);

	const description = selectedGeneration
		? `Generation ${selectedGeneration} selected. You can change your selection or proceed to the next step.`
		: 'Please select the generation of the pokemon.';

	const genEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Generation')
		.setDescription(description);

	return {
		embeds: [genEmbed],
		components: [
			new ActionRowBuilder().addComponents(genSelectMenu),
			handleButtons(stepIndex),
		],
	};
};

const pokemonReply = (
	stepIndex: number,
	attacker?: string,
	defender?: string
) => {
	const pokemonEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Pokemon')
		.setDescription('Please select the Pokemon.')
		.addFields(
			{
				name: 'Attacker',
				value: attacker || 'Not selected',
				inline: true,
			},
			{
				name: 'Defender',
				value: defender || 'Not selected',
				inline: true,
			}
		);

	const addPokemon = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('add_attacker')
			.setLabel('Add Attacker')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('add_defender')
			.setLabel('Add Defender')
			.setStyle(ButtonStyle.Secondary)
	);

	return {
		embeds: [pokemonEmbed],
		components: [handleButtons(stepIndex), addPokemon],
	};
};

const formatReply = (stepIndex: number) => {
	const formatEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Format')
		.setDescription('Please select the battle format.');

	const setFormat = new ActionRowBuilder().addComponents(
		// new ButtonBuilder()
		// 	.setCustomId('set_field')
		// 	.setLabel('Set Field Conditions')
		// 	.setStyle(ButtonStyle.Secondary),
		// new StringSelectMenuBuilder()
		// 	.setCustomId('nature')
		// 	.setPlaceholder('Select a nature')
		// 	.addOptions(
		// 		{
		// 			label: 'Adamant (+Atk, -SpA)',
		// 			value: 'adamant',
		// 		},
		// 		{
		// 			label: 'Bashful',
		// 			value: 'bashful',
		// 		},
		// 		{
		// 			label: 'Bold (+Def, -Atk',
		// 			value: 'bold',
		// 		},
		// 		{
		// 			label: 'Brave (+Atk, -Spe',
		// 			value: 'brave',
		// 		},
		// 		{
		// 			label: 'Calm',
		// 			value: 'calm',
		// 		}
		// 	),
		// new StringSelectMenuBuilder()
		// 	.setCustomId('status_condition')
		// 	.setPlaceholder('Select a status condition')
		// 	.addOptions(
		// 		{
		// 			label: 'Burned',
		// 			value: 'burned',
		// 		},
		// 		{
		// 			label: 'Frozen',
		// 			value: 'frozen',
		// 		},
		// 		{
		// 			label: 'Paralyzed',
		// 			value: 'paralyzed',
		// 		},
		// 		{
		// 			label: 'Poisoned',
		// 			value: 'poisoned',
		// 		},
		// 		{
		// 			label: 'Badly Poisoned',
		// 			value: 'badly_poisoned',
		// 		},
		// 		{
		// 			label: 'Asleep',
		// 			value: 'asleep',
		// 		}
		// 	),
		new StringSelectMenuBuilder()
			.setCustomId('format')
			.setPlaceholder('Select a format')
			.addOptions(
				{
					label: 'Singles',
					value: 'singles',
				},
				{
					label: 'Doubles',
					value: 'doubles',
				}
			)
	);

	return {
		embeds: [formatEmbed],
		components: [handleButtons(stepIndex), setFormat],
	};
};

const moveReply = (stepIndex: number) => {
	const moveEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Move')
		.setDescription('Please select the move.');

	const setMove = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('set_move')
			.setLabel('Set Move')
			.setStyle(ButtonStyle.Secondary)
	);

	return {
		embeds: [moveEmbed],
		components: [handleButtons(stepIndex), setMove],
	};
};

const calcReply = (stepIndex: number, userSelections: UserSelections) => {
	const gen = parseInt(userSelections.generation) as GenerationNum;
	const result = calculate(
		gen,
		new Pokemon(gen, userSelections.pokemon[0].name, {
			item: userSelections.pokemon[0].item,
			nature: userSelections.pokemon[0].nature,
			evs: {
				hp: userSelections.pokemon[0].evs.hp,
				atk: userSelections.pokemon[0].evs.atk,
				def: userSelections.pokemon[0].evs.def,
				spa: userSelections.pokemon[0].evs.spa,
				spd: userSelections.pokemon[0].evs.spd,
				spe: userSelections.pokemon[0].evs.spe,
			},
			boosts: {
				atk: userSelections.pokemon[0].boosts.atk,
				def: userSelections.pokemon[0].boosts.def,
				spa: userSelections.pokemon[0].boosts.spa,
				spd: userSelections.pokemon[0].boosts.spd,
				spe: userSelections.pokemon[0].boosts.spe,
			},
		}),
		new Pokemon(gen, userSelections.pokemon[1].name, {
			item: userSelections.pokemon[1].item,
			nature: userSelections.pokemon[1].nature,
			evs: {
				hp: userSelections.pokemon[1].evs.hp,
				atk: userSelections.pokemon[1].evs.atk,
				def: userSelections.pokemon[1].evs.def,
				spa: userSelections.pokemon[1].evs.spa,
				spd: userSelections.pokemon[1].evs.spd,
				spe: userSelections.pokemon[1].evs.spe,
			},
			boosts: {
				atk: userSelections.pokemon[1].boosts.atk,
				def: userSelections.pokemon[1].boosts.def,
				spa: userSelections.pokemon[1].boosts.spa,
				spd: userSelections.pokemon[1].boosts.spd,
				spe: userSelections.pokemon[1].boosts.spe,
			},
		}),
		new Move(gen, userSelections.move)
	);

	const calcEmbed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Damage Calc')
		.setDescription(result.toString());

	return {
		embeds: [calcEmbed],
		components: [handleButtons(stepIndex)],
	};
};

const replyArray = (userSelections: UserSelections) => {
	const replyArray: any = [];
	replyArray.push(introReply(replyArray.length - 1));
	replyArray.push(genReply(replyArray.length - 1, userSelections.generation));
	replyArray.push(
		pokemonReply(
			replyArray.length - 1,
			userSelections.pokemon[0].name,
			userSelections.pokemon[1].name
		)
	);
	replyArray.push(formatReply(replyArray.length - 1));
	replyArray.push(moveReply(replyArray.length - 1));
	replyArray.push(calcReply(replyArray.length - 1, userSelections));
	return replyArray;
};

const handleButtons = (stepIndex: number) => {
	const steps = 6; // Update this as you add more steps
	const canGoNext = stepIndex < steps - 1;
	const canGoPrevious = stepIndex > 0;

	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('previous')
			.setLabel('◀ Previous')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(!canGoPrevious),
		new ButtonBuilder()
			.setCustomId('next')
			.setLabel('Next ▶')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(!canGoNext)
	);
};

const createMoveModal = (customId: string, title: string) => {
	const modal = new ModalBuilder().setCustomId(customId).setTitle(title);

	const moveNameInput = new TextInputBuilder()
		.setCustomId('move_name')
		.setLabel('Move Name')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('e.g., Fire Punch')
		.setRequired(true)
		.setMaxLength(50);

	const modalActionRow1 = new ActionRowBuilder().addComponents(
		moveNameInput as TextInputBuilder
	);

	return modal.addComponents(
		modalActionRow1 as ActionRowBuilder<TextInputBuilder>
	);
};
const createPokemonModal = (customId: string, title: string) => {
	const modal = new ModalBuilder().setCustomId(customId).setTitle(title);

	const pokemonNameInput = new TextInputBuilder()
		.setCustomId('pokemon_name')
		.setLabel('Pokemon Name')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('e.g., Pikachu')
		.setRequired(true)
		.setMaxLength(50);

	const statModifierInput = new TextInputBuilder()
		.setCustomId('pokemon_stat_modifier')
		.setLabel('Stat Modifier')
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder('e.g. +2 Atk / -3 Def / +2 SpA / +1 SpD / +6 Spe')
		.setRequired(false)
		.setMaxLength(200);

	const abilityInput = new TextInputBuilder()
		.setCustomId('pokemon_ability')
		.setLabel('Ability (Optional)')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('e.g., Static')
		.setRequired(true)
		.setMaxLength(50);

	const itemInput = new TextInputBuilder()
		.setCustomId('pokemon_item')
		.setLabel('Item (Optional)')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('e.g., Light Ball')
		.setRequired(false)
		.setMaxLength(50);

	const evsInput = new TextInputBuilder()
		.setCustomId('pokemon_evs')
		.setLabel('EVs (Optional)')
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder('e.g., 0 HP / 252 Atk / 0 Def / 252 SpD / 252 SpA /0 Spe')
		.setRequired(false)
		.setMaxLength(200);

	// Create action rows for each input
	const firstActionRow = new ActionRowBuilder().addComponents(
		pokemonNameInput as TextInputBuilder
	);
	const secondActionRow = new ActionRowBuilder().addComponents(
		abilityInput as TextInputBuilder
	);
	const thirdActionRow = new ActionRowBuilder().addComponents(
		itemInput as TextInputBuilder
	);
	const fourthActionRow = new ActionRowBuilder().addComponents(
		statModifierInput as TextInputBuilder
	);
	const fifthActionRow = new ActionRowBuilder().addComponents(
		evsInput as TextInputBuilder
	);

	modal.addComponents(
		firstActionRow as ActionRowBuilder<TextInputBuilder>,
		secondActionRow as ActionRowBuilder<TextInputBuilder>,
		thirdActionRow as ActionRowBuilder<TextInputBuilder>,
		fourthActionRow as ActionRowBuilder<TextInputBuilder>,
		fifthActionRow as ActionRowBuilder<TextInputBuilder>
	);

	return modal;
};

export default {
	data: new SlashCommandBuilder()
		.setName('damage-calc')
		.setDescription('Calculates the damage of a move.'),

	async execute(interaction: any) {
		try {
			await interaction.deferReply();

			// Store user selections
			const userSelections: UserSelections = {
				generation: '9',
				move: '(no move)',
				format: 'singles',
				pokemon: [
					{
						name: 'Abomasnow',
						level: 100,
						ability: 'Snow Warning',
						nature: 'Adamant',
						item: '(none)',
						evs: {
							hp: 0,
							atk: 0,
							def: 0,
							spa: 0,
							spd: 0,
							spe: 0,
						},
						boosts: {
							hp: 0,
							atk: 0,
							def: 0,
							spa: 0,
							spd: 0,
							spe: 0,
						},
					},
					{
						name: 'Abomasnow',
						level: 100,
						ability: 'Snow Warning',
						nature: 'Adamant',
						item: '(none)',
						evs: {
							hp: 0,
							atk: 0,
							def: 0,
							spa: 0,
							spd: 0,
							spe: 0,
						},
						boosts: {
							hp: 0,
							atk: 0,
							def: 0,
							spa: 0,
							spd: 0,
							spe: 0,
						},
					},
				],
				// Initialize other required properties here
			};

			let stepIndex = 0;

			const updateMessage = async () => {
				const replies = replyArray(userSelections);
				await interaction.editReply(replies[stepIndex]);
			};

			await updateMessage();

			const message = await interaction.fetchReply();
			const collector = message.createMessageComponentCollector({
				time: 30000, // 5 minutes timeout
			});

			collector.on('collect', async (componentInteraction: any) => {
				collector.resetTimer();

				// Handle button interactions
				if (componentInteraction.isButton()) {
					const buttonInteraction = componentInteraction as ButtonInteraction;

					if (buttonInteraction.customId === 'previous' && stepIndex > 0) {
						stepIndex--;
						await updateMessage();
						await buttonInteraction.deferUpdate();
					}

					if (
						buttonInteraction.customId === 'next' &&
						stepIndex < replyArray(userSelections).length - 1
					) {
						stepIndex++;
						await updateMessage();
						await buttonInteraction.deferUpdate();
					}

					if (buttonInteraction.customId === 'set_move') {
						await buttonInteraction.showModal(
							createMoveModal('select_move', 'Select Move')
						);

						try {
							const modalInteraction = await buttonInteraction.awaitModalSubmit(
								{
									time: 60000, // Time in milliseconds to wait for the submission
									filter: (i) =>
										i.customId === 'select_move' &&
										i.user.id === buttonInteraction.user.id,
								}
							);

							const moveName =
								modalInteraction.fields.getTextInputValue('move_name');
							userSelections.move = moveName;

							await modalInteraction.reply({
								content: 'Modal submitted successfully!',
								flags: MessageFlags.Ephemeral,
							});
							updateMessage();
						} catch (error) {
							console.error(error);
						}
					}

					if (
						buttonInteraction.customId === 'add_attacker' ||
						buttonInteraction.customId === 'add_defender'
					) {
						const role = buttonInteraction.customId.split('_')[1];

						await buttonInteraction.showModal(
							createPokemonModal(role, role.toUpperCase())
						);

						try {
							const modalInteraction = await buttonInteraction.awaitModalSubmit(
								{
									time: 60000, // Time in milliseconds to wait for the submission
									filter: (i) =>
										i.customId === role &&
										i.user.id === buttonInteraction.user.id,
								}
							);

							// Extract the submitted data
							const pokemonName =
								modalInteraction.fields.getTextInputValue('pokemon_name');
							const stats = modalInteraction.fields.getTextInputValue(
								'pokemon_stat_modifier'
							);
							const ability =
								modalInteraction.fields.getTextInputValue('pokemon_ability') ||
								'(other)';
							const item =
								modalInteraction.fields.getTextInputValue('pokemon_item') ||
								'(none)';
							const evs =
								modalInteraction.fields.getTextInputValue('pokemon_evs') ||
								undefined;

							const evsData = {
								hp: 0,
								atk: 0,
								def: 0,
								spa: 0,
								spd: 0,
								spe: 0,
							};

							const boostData = {
								hp: 0,
								atk: 0,
								def: 0,
								spa: 0,
								spd: 0,
								spe: 0,
							};

							evs?.split('/').forEach((ev) => {
								console.log(`EV: ${ev}`);

								const parts = ev.trim().toLowerCase().split(' ');

								const value = parts[0];
								const stat = parts.slice(1).join('_');

								console.log(`Stat: ${stat}, Value: ${value}`); // Log the stat, value);
								if (stat in evsData) {
									(evsData as any)[stat] = parseInt(value);
								} else {
									console.error(`Invalid stat: ${stat}`);
								}
							});

							stats?.split('/').forEach((stat) => {
								console.log(`Stat: ${stat}`);

								const parts = stat.trim().toLowerCase().split(' ');

								const value = parts[0];
								const statName = parts.slice(1).join('_');

								console.log(`Stat: ${statName}, Boost: ${value}`); // Log the stat, value);
								if (statName in boostData) {
									(boostData as any)[statName] = parseInt(value);
								} else {
									console.error(`Invalid stat: ${statName}`);
								}
							});

							if (role === 'attacker') {
								// Store the data
								userSelections.pokemon[0] = {
									name: pokemonName,
									level: userSelections.pokemon?.[0]?.level || 100,
									nature: userSelections.pokemon?.[0]?.nature || 'hardy',
									ability: ability || '(none)',
									item: item || '(none)',
									evs: evsData || {
										Hp: 0,
										Atk: 0,
										Def: 0,
										SpA: 0,
										SpD: 0,
										Spe: 0,
									},
									boosts: boostData || {
										Hp: 0,
										Atk: 0,
										Def: 0,
										SpA: 0,
										SpD: 0,
										Spe: 0,
									},
								};

								console.log(
									`Attacker data: ${JSON.stringify(userSelections.pokemon[0])}`
								);
							} else {
								// Store the data
								userSelections.pokemon[1] = {
									name: pokemonName,
									level: userSelections.pokemon?.[0]?.level || 100,
									nature: userSelections.pokemon?.[0]?.nature || 'hardy',
									ability: ability || '(none)',
									item: item || '(none)',
									evs: evsData || {
										Hp: 0,
										Atk: 0,
										Def: 0,
										SpA: 0,
										SpD: 0,
										Spe: 0,
									},
									boosts: boostData || {
										Hp: 0,
										Atk: 0,
										Def: 0,
										SpA: 0,
										SpD: 0,
										Spe: 0,
									},
								};

								console.log(
									`Defender data: ${JSON.stringify(userSelections.pokemon[1])}`
								);
							}

							await modalInteraction.reply({
								content: 'Modal submitted successfully!',
								flags: MessageFlags.Ephemeral,
							});
							updateMessage();
						} catch (error) {
							console.error(error);
						}
					}
				}

				// Handle string select menu interactions
				if (componentInteraction.isStringSelectMenu()) {
					const selectInteraction =
						componentInteraction as StringSelectMenuInteraction;

					if (selectInteraction.customId === 'generation') {
						// Store the selected generation
						userSelections.generation = selectInteraction.values[0];

						console.log(
							`User selected generation: ${userSelections.generation}`
						);

						// Update the message to show the selection
						await updateMessage();
						await selectInteraction.deferUpdate();
					}

					if (selectInteraction.customId === 'format') {
						userSelections.format = selectInteraction.values[0];

						console.log(`User selected format: ${userSelections.format}`);
						// Update the message to show the selection
						await updateMessage();
						await selectInteraction.deferUpdate();
					}
				}
			});

			collector.on('end', async () => {
				// Disable all components when collector ends
				const replies = replyArray(userSelections);
				const finalReply = replies[stepIndex];

				// Disable all components
				const disabledComponents = finalReply.components?.map((row: any) => {
					const newRow = ActionRowBuilder.from(row);
					newRow.components.forEach((component: any) => {
						component.setDisabled(true);
					});
					return newRow;
				});

				await interaction.editReply({
					embeds: finalReply.embeds,
					components: disabledComponents || [],
				});

				// At this point, you have access to all user selections
				console.log('Final user selections:', userSelections);
			});
		} catch (error) {
			console.error(error);
		}
	},
};
