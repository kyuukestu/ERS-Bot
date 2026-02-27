import { ChatInputCommandInteraction } from 'discord.js';
import { db } from '~/database/SQL/database';
import { paginateEvents } from '~/components/pagination/eventsPagination';

export async function listEventsQuery(
	interaction: ChatInputCommandInteraction,
) {
	const filter = interaction.options.getInteger('status-filter', true); // 0 | 1 | 2

	try {
		let query = `
			SELECT title, event_date, completed
			FROM events
		`;

		const params: any[] = [];

		if (filter !== 2) {
			query += ` WHERE completed = ?`;
			params.push(filter);
		}

		query += ` ORDER BY event_date ASC`;

		const events = db.query(query).all(...params);

		if (!events.length) {
			return interaction.editReply({
				content: 'No events found for that filter.',
			});
		}

		return paginateEvents(interaction, events, filter);
	} catch (error) {
		console.error(error);
		return interaction.editReply({
			content: 'Database error while fetching events.',
		});
	}
}
