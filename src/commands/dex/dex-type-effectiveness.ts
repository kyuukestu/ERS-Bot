import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	AttachmentBuilder,
} from 'discord.js';
import { formatUserInput } from '../../utility/formatting/formatUserInput.ts';
import { ALL_TYPES, type PokemonType } from '~/database/pokemonTypes';
import { renderCombinedTypeEffectivenessCanvas } from '~/utility/typeEffectivenessCanvas.ts';
import { getTypeChart } from '~/database/typeChart.ts';
// src/utility/discord/typeChoices.ts
import { TYPE_CHOICES } from '~/database/typeChoices.ts';

export const typeChoices = TYPE_CHOICES.map((type) => ({
	name: type.charAt(0).toUpperCase() + type.slice(1),
	value: type,
}));

export default {
	data: new SlashCommandBuilder()
		.setName('dex-type-effectiveness')
		.setDescription(
			'Shows type effectiveness for a combination of up to three types.'
		)
		.addStringOption((opt) =>
			opt
				.setName('type-1')
				.setDescription('First Type')
				.setRequired(true)
				.addChoices(...typeChoices)
		)
		.addStringOption((opt) =>
			opt
				.setName('type-2')
				.setDescription('Second Type')
				.setRequired(false)
				.addChoices(...typeChoices)
		)
		.addStringOption((opt) =>
			opt
				.setName('type-3')
				.setDescription('Third Type')
				.setRequired(false)
				.addChoices(...typeChoices)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			await interaction.deferReply();

			// Gather types
			const rawTypes = [
				interaction.options.getString('type-1', true),
				interaction.options.getString('type-2', false),
				interaction.options.getString('type-3', false),
			].filter(Boolean) as string[];

			const types = rawTypes.map(formatUserInput) as PokemonType[];

			// Validate types
			for (const type of types) {
				if (!ALL_TYPES.includes(type)) {
					await interaction.editReply(`Invalid type: ${type}`);
					return;
				}
			}

			// Fetch type effectiveness chart
			const { offense, defense } = getTypeChart(types);

			// Build title string
			const title = `Type Effectiveness: ${types
				.map((t) => t.toUpperCase())
				.join(' / ')}`;

			// Render combined canvas
			const buffer = await renderCombinedTypeEffectivenessCanvas({
				title,
				offense,
				defense,
			});

			const attachment = new AttachmentBuilder(buffer, {
				name: 'type-effectiveness.png',
			});

			await interaction.editReply({ content: title, files: [attachment] });
		} catch (err) {
			console.error('Error executing dex-type-effectiveness:', err);
			await interaction.editReply(
				'An error occurred while processing your request.'
			);
		}
	},
};
