import { ChatInputCommandInteraction } from 'discord.js';
import { db } from '~/database/SQL/database';

export async function createEventQuery(
	interaction: ChatInputCommandInteraction,
) {
	const title = interaction.options.getString('title', true);
	const description = interaction.options.getString('description', true);
	const date = interaction.options.getString('date', false) ?? null;
	const time = interaction.options.getString('time', false) ?? '00:00';

	try {
		const result = db
			.query(
				`
				INSERT INTO events (title, description, event_date, event_time)
				VALUES (?, ?, ?, ?)`,
			)
			.run(title, description, date, time ?? null);

		if (result.changes !== 1) {
			await interaction.editReply({
				content: 'Failed to create event.',
			});

			throw new Error('Failed to create event.');
		}
		await interaction.editReply({
			content: `Event: **${title}** Created Successfully`,
		});
	} catch (err: any) {
		if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			return interaction.editReply({
				content: `An event titled "${title}" already exists.`,
			});
		}

		console.error(err);
		return interaction.editReply({
			content: 'Failed to create event.',
		});
	}
}
