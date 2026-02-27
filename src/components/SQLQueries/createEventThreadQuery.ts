import { ChatInputCommandInteraction } from 'discord.js';
import { db } from '~/database/SQL/database';

export async function createEventThreadQuery(
	interaction: ChatInputCommandInteraction,
) {
	const title = interaction.options.getString('title', true);

	const event = db
		.query(
			`
		SELECT id, event_date, event_time FROM events
		WHERE title = ?`,
		)
		.get(title);

	if (!event) {
		return interaction.editReply({
			content: `No event found titled "${title}".`,
		});
	}

	if (!event.event_date) {
		await interaction.editReply({
			content: `Cannot create thread for ${title} because it does not have a scheduled date!`,
		});
	}

	// 2️⃣ Send confirmation message
	const message = await interaction.editReply({
		content: `Event: **${title}** scheduled for ${event.event_date}${event.event_time ? ` at ${event.event_time}` : ''}`,
	});

	const thread = await message.startThread({
		name: `Event: ${title}`,
		autoArchiveDuration: 1440, // 24 hours
	});

	// 4️⃣ Update event with thread ID
	db.query(
		`
			UPDATE events
			SET thread_id = ?
			WHERE id = ?
		`,
	).run(thread.id, event.id);
}
