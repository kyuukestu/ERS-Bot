import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	StringSelectMenuBuilder,
	ActionRowBuilder,
	StringSelectMenuOptionBuilder,
	MessageFlags,
	ComponentType,
} from 'discord.js';
import { THREAD_CONFIG } from '~/database/SQL/database';
import { rssDB } from '~/database/SQL/database';

// Pre-build options outside the execute function for better performance
const options = Array.from(THREAD_CONFIG.entries()).map(([id, name]) =>
	new StringSelectMenuOptionBuilder().setLabel(name).setValue(id),
);

export default {
	data: new SlashCommandBuilder()
		.setName('thread-tagging')
		.setDescription('Select threads to receive notifications for.'),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // 1. Create the Select Menu
		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId('thread_notification_select')
			.setPlaceholder('Select threads to follow...')
			.addOptions(options)
			.setMinValues(1)
			.setMaxValues(options.length);

		// 2. Wrap in an Action Row
		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			selectMenu,
		);

		// 3. Reply to the interaction
		const response = await interaction.followUp({
			content: 'Which threads would you like to be tagged in?',
			components: [row],
			// Use 'ephemeral: true' instead of MessageFlags
			flags: MessageFlags.Ephemeral,
		});

		// --- Collector Logic ---
		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			time: 60_000, // 1 minute timeout
		});

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) return;

			const selectedThreadIDs = i.values; // Array of IDs like ['536653', '536282']
			const userIdTag = `<@${i.user.id}>`;

			// Prepare the statement to fetch current tags
			const selectStmt = rssDB.prepare(
				'SELECT tags FROM rss_feed WHERE threadID = ?',
			);
			const updateStmt = rssDB.prepare(
				'UPDATE rss_feed SET tags = ? WHERE threadID = ?',
			);

			for (const threadID of selectedThreadIDs) {
				const row = selectStmt.get(threadID) as
					| { tags: string | null }
					| undefined;

				const currentTags = row?.tags
					? row.tags.split(',').map((t) => t.trim())
					: [];

				// Add user if they aren't already there
				if (!currentTags.includes(userIdTag)) {
					currentTags.push(userIdTag);
					updateStmt.run(currentTags.join(', '), threadID);
				}
			}

			await i.update({
				content: `Success! You've been added to ${selectedThreadIDs.length} thread(s).`,
				components: [], // Remove menu after selection
			});

			collector.stop();
		});
	},
};
