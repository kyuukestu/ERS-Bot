import { ChatInputCommandInteraction } from 'discord.js';
import { db } from '~/database/SQL/database';

export async function updateEventQuery(
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();

	const title = interaction.options.getString('event-title', true);
	const newTitle = interaction.options.getString('new-title', false) ?? null;
	const newDescription =
		interaction.options.getString('new-description', false) ?? null;
	const newDate = interaction.options.getString('new-date', false) ?? null;
	const newTime = interaction.options.getString('new-time', false) ?? null;
	try {
		const event = db
			.query(
				`
        SELECT id FROM events
        WHERE title = ?`,
			)
			.get(title);

		if (!event) {
			return interaction.editReply({
				content: `No event found titled "${title}".`,
			});
		}

		const updates: string[] = [];
		const values: any[] = [];

		if (newTitle) {
			updates.push('title = ?');
			values.push(newTitle);
		}

		if (newDescription) {
			updates.push('description = ?');
			values.push(newDescription);
		}

		if (newDate) {
			updates.push('event_date = ?');
			values.push(newDate);
		}

		if (newTime) {
			updates.push('event_time = ?');
			values.push(newTime);
		}

		if (updates.length === 0) {
			return interaction.editReply({
				content: 'No new data provided to update.',
			});
		}

		values.push(event.id);

		const result = db
			.query(
				`
		UPDATE events
		SET ${updates.join(', ')}
		WHERE id = ?
	`,
			)
			.run(...values);

		if (result.changes !== 1) {
			return interaction.editReply({
				content: 'Event update failed.',
			});
		}

		return interaction.editReply({
			content: `Event updated successfully.\n Changes: ${values.join(', ')}`,
		});
	} catch (error) {
		interaction.editReply(`${error}`);
	}
}
