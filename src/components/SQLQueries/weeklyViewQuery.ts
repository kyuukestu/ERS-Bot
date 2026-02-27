import {
	ChatInputCommandInteraction,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
} from 'discord.js';
import { db } from '~/database/SQL/database';

// ------------------------
// Utility Functions
// ------------------------
function getStartOfWeek(date: Date) {
	const d = new Date(date);
	const day = d.getDay(); // Sunday = 0
	d.setDate(d.getDate() - day);
	d.setHours(0, 0, 0, 0);
	return d;
}

function formatDateKey(date: Date) {
	return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function buildWeekMap(baseDate: Date, events: any[]) {
	const weekStart = getStartOfWeek(baseDate);
	const days: Record<string, any[]> = {};

	for (let i = 0; i < 7; i++) {
		const currentDay = new Date(weekStart);
		currentDay.setDate(weekStart.getDate() + i);
		const key = formatDateKey(currentDay);
		days[key] = [];
	}

	for (const event of events) {
		if (days[event.event_date]) {
			days[event.event_date].push(event);
		}
	}

	return { days, weekStart };
}

function ordinal(n: number) {
	if (n > 3 && n < 21) return 'th';
	switch (n % 10) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
}

function formatDayHeader(date: Date) {
	const options: Intl.DateTimeFormatOptions = {
		weekday: 'long',
		month: 'long',
	};
	const day = date.getDate();
	return `${date.toLocaleDateString('en-US', options)} ${day}${ordinal(day)}`;
}

function renderWeekCodeBlock(days: Record<string, any[]>) {
	let output = '```';
	for (const [dateStr, dayEvents] of Object.entries(days)) {
		const header = formatDayHeader(new Date(dateStr));
		output += `\n${header}\n`;

		if (!dayEvents.length) {
			output += `  - No events\n`;
		} else {
			for (const e of dayEvents) {
				output += `  • ${e.title} ${e.completed ? '✅' : '⏳'}\n`;
			}
		}
	}
	output += '```';
	return output;
}

// ------------------------
// Execute Function
// ------------------------
export async function weeklyViewQuery(
	interaction: ChatInputCommandInteraction,
) {
	const userDate = interaction.options.getString('date', false);
	const filter = interaction.options.getInteger('status-filter', false) ?? 2; // default: Both

	// Step 1: Fetch events from DB
	let allEvents = db
		.query(
			`
		SELECT title, event_date, completed
		FROM events
		ORDER BY event_date ASC
	`,
		)
		.all();

	if (filter !== 2) {
		allEvents = allEvents.filter((e) => e.completed === filter);
	}

	if (!allEvents.length) {
		return interaction.editReply({
			content: 'No events found for the selected filter.',
		});
	}

	// Step 2: Determine base date
	let baseDate: Date;
	if (userDate) {
		const parsed = new Date(userDate);
		if (isNaN(parsed.getTime())) {
			return interaction.editReply({ content: 'Invalid date format.' });
		}
		baseDate = parsed;
	} else {
		// Earliest unfinished event
		const earliest = allEvents.find((e) => e.completed === 0);
		baseDate = earliest ? new Date(earliest.event_date) : new Date();
	}

	// Step 3: Initialize pagination state
	const currentWeekStart = getStartOfWeek(baseDate);

	const updateMessage = async () => {
		const weekEnd = new Date(currentWeekStart);
		weekEnd.setDate(currentWeekStart.getDate() + 7);

		const weekEvents = allEvents.filter(
			(e) =>
				e.event_date >= formatDateKey(currentWeekStart) &&
				e.event_date < formatDateKey(weekEnd),
		);

		const { days } = buildWeekMap(currentWeekStart, weekEvents);
		const description = renderWeekCodeBlock(days);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('prev')
				.setLabel('Previous')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId('next')
				.setLabel('Next')
				.setStyle(ButtonStyle.Secondary),
		);

		return interaction.editReply({
			content: `**Week of ${formatDateKey(currentWeekStart)}**\n\n${description}`,
			components: [row],
		});
	};

	await updateMessage();
	const message = await interaction.fetchReply();

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 60_000,
	});

	collector.on('collect', async (i) => {
		if (i.user.id !== interaction.user.id)
			return i.reply({ content: 'Not your calendar.', ephemeral: true });
		
		// Acknowledge the button click so Discord doesn't show "Interaction failed"
	await i.deferUpdate();

		if (i.customId === 'prev')
			currentWeekStart.setDate(currentWeekStart.getDate() - 7);
		if (i.customId === 'next')
			currentWeekStart.setDate(currentWeekStart.getDate() + 7);

		await updateMessage();
	});

	collector.on('end', async () => {
		// Disable buttons after timeout
		await interaction.editReply({ components: [] });
	});
}
