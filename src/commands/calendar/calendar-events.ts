import {
	SlashCommandBuilder,
	type SlashCommandStringOption,
	type SlashCommandIntegerOption,
	type ChatInputCommandInteraction,
} from 'discord.js';

import { createEventQuery } from '~/components/SQLQueries/createEventQuery';
import { createEventThreadQuery } from '~/components/SQLQueries/createEventThreadQuery';
import { updateEventQuery } from '~/components/SQLQueries/updateEventQuery';
import { changeCompletionStatusQuery } from '~/components/SQLQueries/completeEventQuery';
import { deleteEventQuery } from '~/components/SQLQueries/deleteEventQuery';
import { listEventsQuery } from '~/components/SQLQueries/listEventsQuery';
import { weeklyViewQuery } from '~/components/SQLQueries/weeklyViewQuery';

export default {
	data: new SlashCommandBuilder()
		.setName('calendar')
		.setDescription('Provides and manages in-RP Calendar.')
		.addSubcommandGroup((group) =>
			group
				.setName('events')
				.setDescription('Handles RP events.')
				.addSubcommand((sub) =>
					sub
						.setName('create-event')
						.setDescription('Creates an event and adds it to the database.')
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('event-title')
								.setDescription('Event Title.')
								.setRequired(true),
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('description')
								.setDescription('Event Description.')
								.setRequired(true)
								.setMaxLength(500),
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('date')
								.setDescription(
									'Event Date | Date must be in YYYY-MM-DD format',
								)
								.setRequired(false),
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('time')
								.setDescription('Event Time')
								.setRequired(false),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('update-event')
						.setDescription('Updates an event in the Database.')
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('event-title')
								.setDescription('Event Title.')
								.setRequired(true),
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('new-title')
								.setDescription('Event Title.')
								.setRequired(false),
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('new-description')
								.setDescription('Event Description.')
								.setRequired(false)
								.setMaxLength(500),
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('new-date')
								.setDescription('Event Date')
								.setRequired(false),
						)
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('new-time')
								.setDescription('Event Time')
								.setRequired(false),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('create-thread')
						.setDescription('Creates a thread for an event.')
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('event-title')
								.setDescription('Event Title')
								.setRequired(true),
						),
				)
				//NOTE - Consider rolling this into the update-event command
				.addSubcommand((sub) =>
					sub
						.setName('complete-event')
						.setDescription('Sets the status of an event to finished.')
						.addStringOption((option: SlashCommandStringOption) =>
							option.setName('event-title').setDescription('Event Title'),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('delete-event')
						.setDescription('Deletes an event from the database.')
						.addStringOption((option: SlashCommandStringOption) =>
							option.setName('event-title').setDescription('Event Title'),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('list-events')
						.setDescription('Lists all events in the database.')
						.addIntegerOption((option: SlashCommandIntegerOption) =>
							option
								.setName('status-filter')
								.setDescription('Filter by completion status.')
								.addChoices(
									{ name: 'Not Completed', value: 0 },
									{ name: 'Completed', value: 1 },
									{ name: 'Both', value: 2 },
								)
								.setRequired(true),
						),
				),
		)
		.addSubcommandGroup((group) =>
			group
				.setName('views')
				.setDescription('Calendar Views for Events')
				.addSubcommand((sub) =>
					sub
						.setName('weekly-view')
						.setDescription('View events week-by-week.')
						.addStringOption((option: SlashCommandStringOption) =>
							option
								.setName('date')
								.setDescription(
									'Set Date you want to see week of | Date must be in YYYY-MM-DD format',
								),
						),
				),
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const date = interaction.options.getString('date', false) ?? '0000-00-00';

		const subCommand = interaction.options.getSubcommand();
		const commandGroup = interaction.options.getSubcommandGroup();

		try {
			await interaction.deferReply();

			// Test Date format YYYY-MM-DD
			const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

			if (!dateRegex.test(date)) {
				return interaction.editReply({
					content: 'Date must be in YYYY-MM-DD format.',
				});
			}

			if (commandGroup === 'events' && subCommand === 'create-event') {
				await createEventQuery(interaction);
			} else if (commandGroup === 'events' && subCommand === 'create-thread') {
				await createEventThreadQuery(interaction);
			} else if (commandGroup === 'events' && subCommand === 'update-event') {
				await updateEventQuery(interaction);
			} else if (commandGroup === 'events' && subCommand === 'complete-event') {
				await changeCompletionStatusQuery(interaction);
			} else if (commandGroup === 'events' && subCommand === 'delete-event') {
				await deleteEventQuery(interaction);
			} else if (commandGroup === 'events' && subCommand === 'list-events') {
				await listEventsQuery(interaction);
			} else if (commandGroup === 'views' && subCommand === 'weekly-view') {
				await weeklyViewQuery(interaction);
			}
		} catch (error) {
			interaction.editReply(`${error}`);
		}
	},
};
