/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculate, Pokemon, Move, Field } from '@smogon/calc';
import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ActionRowBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ButtonInteraction,
	StringSelectMenuInteraction,
	ComponentType,
} from 'discord.js';

// Store user selections
interface UserSelections {
	generation?: string;
	// Add other selections as you build more steps
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

const replyArray = (userSelections: UserSelections) => {
	const replyArray: any = [];
	replyArray.push(introReply(0));
	replyArray.push(genReply(1, userSelections.generation));
	return replyArray;
};

const handleButtons = (stepIndex: number) => {
	const steps = 2; // Update this as you add more steps
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

export default {
	data: new SlashCommandBuilder()
		.setName('damage-calc')
		.setDescription('Calculates the damage of a move.'),

	async execute(interaction: ChatInputCommandInteraction) {
		try {
			await interaction.deferReply();

			// Store user selections
			const userSelections: UserSelections = {};

			let stepIndex = 0;

			const updateMessage = async () => {
				const replies = replyArray(userSelections);
				await interaction.editReply(replies[stepIndex]);
			};

			await updateMessage();

			const message = await interaction.fetchReply();
			const collector = message.createMessageComponentCollector({
				time: 300000, // 5 minutes timeout
			});

			collector.on('collect', async (componentInteraction) => {
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

						// You can now use userSelections.generation elsewhere in your code
						// For example, you might want to automatically go to the next step:
						// stepIndex++;
						// await updateMessage();
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
