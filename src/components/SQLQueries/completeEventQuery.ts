import { ChatInputCommandInteraction } from 'discord.js';
import { db } from '~/database/SQL/database';

export async function changeCompletionStatusQuery(
	interaction: ChatInputCommandInteraction,
) {
	const title = interaction.options.getString('event-title', true);

	try {
		const event = db
			.query(
				`
				SELECT id, completed
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

		const newStatus = event.completed === 0 ? 1 : 0;

		const result = db
			.query(
				`
			UPDATE events
			SET completed = ?
			WHERE id = ?
		`,
			)
			.run(newStatus, event.id);

		if (result.changes !== 1) {
			return interaction.editReply({
				content: 'Event update failed.',
			});
		}

		return interaction.editReply({
			content: `Event updated successfully.\nEvent: **${title}** Status changed to ${
				newStatus === 1 ? 'Completed' : 'Not Completed'
			}`,
		});
	} catch (error) {
		console.error(error);
		return interaction.editReply({
			content: 'Database error while updating event.',
		});
	}
}
