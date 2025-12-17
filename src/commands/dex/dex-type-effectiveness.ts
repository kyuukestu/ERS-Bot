import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	AttachmentBuilder,
} from 'discord.js';
import { formatUserInput } from '../../utility/formatting/formatUserInput.ts';
import { ALL_TYPES, type PokemonType } from '~/database/pokemonTypes';
import {
	renderCombinedTypeEffectivenessCanvas,
	renderSummaryBlock,
} from '~/utility/typeEffectivenessCanvas.ts';
import { getTypeChart } from '~/database/typeChart.ts';
import { TYPE_CHOICES } from '~/database/typeChoices.ts';
import fs from 'node:fs/promises';
import path from 'node:path';

const TypeChartDir = path.resolve(process.cwd(), 'public', 'typeChart');
//'../../../public/typeChart';

let dirReady = false;

async function ensureDir() {
	if (!dirReady) {
		await fs.mkdir(TypeChartDir, { recursive: true });
		dirReady = true;
	}
}

export const typeChoices = TYPE_CHOICES.map((type) => ({
	name: type.charAt(0).toUpperCase() + type.slice(1),
	value: type,
}));

export default {
	data: new SlashCommandBuilder()
		.setName('dex-icon-effectiveness')
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
		)
		.addBooleanOption((opt) =>
			opt
				.setName('detailed')
				.setDescription('Show the full effectiveness grid more prominently')
				.setRequired(false)
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
			const detailed = interaction.options.getBoolean('detailed') ?? false;

			const types = rawTypes.map(formatUserInput) as PokemonType[];

			// Validate types
			for (const type of types) {
				if (!ALL_TYPES.includes(type)) {
					await interaction.editReply(`Invalid type: ${type}`);
					return;
				}
			}
			await ensureDir();

			const normalizedTypes = [...new Set(types)].sort();

			// Build title string
			const title = `Type Effectiveness: ${normalizedTypes
				.map((t) => t.toUpperCase())
				.join('-')}`;

			const filename = detailed
				? `${normalizedTypes
						.map((t) => t.toUpperCase())
						.join('-')}-detailed.png`
				: `${normalizedTypes.map((t) => t.toUpperCase()).join('-')}.png`;
			const filepath = path.join(TypeChartDir, filename);

			let buffer: Buffer;

			try {
				// Try to reuse cached image
				buffer = await fs.readFile(filepath);
			} catch (err: any) {
				if (err.code !== 'ENOENT') {
					throw err; // real error, don't hide it
				}

				// File does not exist → generate
				const { offense, defense } = getTypeChart(types);

				buffer = detailed
					? await renderCombinedTypeEffectivenessCanvas({
							title,
							offense,
							defense,
					  })
					: await renderSummaryBlock({ offense, defense });

				await fs.writeFile(filepath, buffer);
			}

			const attachment = new AttachmentBuilder(buffer, {
				name: filename,
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
