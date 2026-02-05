import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	type SlashCommandStringOption,
	type SlashCommandIntegerOption,
} from 'discord.js';
import { typeChoices } from '~/database/typeChoices.ts';

import { getMoveInfo } from '~/components/handlers/getMoveInfo';
import { getFilterListMoves } from '~/components/handlers/getFilterListMove';
import { getFilterListPokemon } from '~/components/handlers/getFilterListPokemon';

export default {
	data: new SlashCommandBuilder()
		.setName('dex-moves')
		.setDescription(
			'Provides information about a Pokémon move or searches for a list of moves based on criteria.',
		)
		.addSubcommandGroup((group) =>
			group
				.setName('move-info')
				.setDescription('Provides information about a Pokémon move.')
				.addSubcommand((sub) =>
					sub
						.setName('move')
						.setDescription(
							'Provides information about a Pokémon move e.g. Glaciate, Searing Shot, Toxic Thread, etc.',
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('move')
								.setDescription('Enter the move name.')
								.setRequired(true),
						),
				),
		)
		.addSubcommandGroup((group) =>
			group
				.setName('filter-list')
				.setDescription('Provides a list of moves based on chosen criteria.')
				.addSubcommand((sub) =>
					sub
						.setName('filters')
						.setDescription(
							'Provides a list of moves based on chosen criteria.',
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('type')
								.setDescription('Enter the move type.')
								.addChoices(...typeChoices)
								.setRequired(false),
						)
						.addIntegerOption((option: SlashCommandIntegerOption) =>
							option
								.setName('min_power')
								.setDescription('Enter the minimum base power.')
								.setMinValue(0)
								.setMaxValue(500)
								.setRequired(false),
						)
						.addIntegerOption((option: SlashCommandIntegerOption) =>
							option
								.setName('max_power')
								.setDescription('Enter the maximum base power.')
								.setMinValue(0)
								.setMaxValue(500)
								.setRequired(false),
						)
						.addIntegerOption((option: SlashCommandIntegerOption) =>
							option
								.setName('min_accuracy')
								.setDescription('Enter minimum accuracy.')
								.setMinValue(0)
								.setMaxValue(101)
								.setRequired(false),
						)
						.addIntegerOption((option: SlashCommandIntegerOption) =>
							option
								.setName('max_accuracy')
								.setDescription('Enter maximum accuracy.')
								.setMinValue(0)
								.setMaxValue(101)
								.setRequired(false),
						)

						.addIntegerOption((option: SlashCommandIntegerOption) =>
							option
								.setName('priority')
								.setDescription('Enter move accuracy. (Perfect = 101)')
								.setMinValue(-7)
								.setMaxValue(5)
								.setRequired(false),
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('category')
								.setDescription('Physical, Special, Status?')
								.addChoices(
									{ name: 'Physical', value: 'physical' },
									{ name: 'Special', value: 'special' },
									{ name: 'Status', value: 'status' },
								)
								.setRequired(false),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('pokemon')
						.setDescription(
							'Provides a list of Pokemon that can learn the move.',
						)
						.addStringOption((option) =>
							option
								.setName('move')
								.setDescription('Enter the Move name.')
								.setRequired(true),
						)
						.addStringOption((option) =>
							option
								.setName('type-1')
								.setDescription('Enter the move type.')
								.addChoices(...typeChoices)
								.setRequired(false),
						)
						.addStringOption((option) =>
							option
								.setName('type-2')
								.setDescription('Enter the move type.')
								.addChoices(...typeChoices)
								.setRequired(false),
						),
				),
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const subCommand = interaction.options.getSubcommand();
		const commandGroup = interaction.options.getSubcommandGroup();

		if (commandGroup === 'move-info' && subCommand === 'move') {
			await getMoveInfo(interaction);
		} else if (commandGroup === 'filter-list' && subCommand === 'filters') {
			await getFilterListMoves(interaction);
		} else if (commandGroup === 'filter-list' && subCommand === 'pokemon') {
			await getFilterListPokemon(interaction);
		}
	},
};
