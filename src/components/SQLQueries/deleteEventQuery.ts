import { ChatInputCommandInteraction } from 'discord.js';
import { db } from '~/database/SQL/database';

export async function deleteEventQuery(
	interaction: ChatInputCommandInteraction,
) {
	const title = interaction.options.getString('event-title', true);

	try {
		const event = db
			.query(
				`
                SELECT id
                FROM events
                WHERE title = ?
            `,
			)
			.get(title);

		if (!event) {
			return interaction.editReply({
				content: `No event found titled "${title}".`,
			});
		}

		const result = db
			.query(
				`
                DELETE FROM events
                WHERE id = ?
            `,
			)
			.run(event.id);

		if (result.changes !== 1) {
			return interaction.editReply({
				content: 'Event deletion failed.',
			});
		}

		return interaction.editReply({
			content: `Event deleted successfully.
			}`,
		});
	} catch (error) {
		console.error(error);
		return interaction.editReply({
			content: 'Database error while updating event.',
		});
	}
}
