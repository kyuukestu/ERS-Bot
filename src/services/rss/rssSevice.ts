import { XMLParser } from 'fast-xml-parser';
import { rssDB } from '~/database/SQL/database';
import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { initializeSQLDB } from '~/database/SQL/database';

initializeSQLDB();

const FEED_URL = 'https://www.rpnation.com/forums/-/index.rss';
const CHANNEL_ID = '1479329634792505508';

const xmlParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: '@_',
	parseTagValue: true,
	isArray: (name) => name === 'item',
});

const allowedThreadIDs = new Set([
	'536653', // Kanto IC
	'536282', // Johto IC
	'536427', // Hoenn IC
	'536347', // Sinnoh IC
	'536371', // Unova IC
	'536922', // Kalos IC
	'536341', // Alola IC
	'536350', // Galar IC
	'536348', // Paldea IC
	'536297', // Orange Islands IC
	'551406', // Oblivia IC
	'560446', // Sanguine Swarms IC
	'565794', // Lilycove WCS IC
	'555337', // Medieval Festival IC
	'536418', // Main OOC
	'560252', // Sanguine Swarm OOC
	'566603', // Chatter
	'536117', // Main CS
	'570906', // Elder Carp
	'570988', // Elder Carp CS
	'571433', // Lumiose Blues
]);

export class RSSService {
	private client: Client;
	private channel: TextChannel | null = null;
	private initialized = false;

	constructor(client: Client) {
		this.client = client;
	}

	async start() {
		const channel = await this.client.channels.fetch(CHANNEL_ID);
		if (!channel || !channel.isTextBased()) {
			console.error('Could not find or access the RSS notification channel.');
			return;
		}
		this.channel = channel as TextChannel;

		console.log('RSS Service started');
		await this.pollFeed();

		setInterval(
			() => {
				this.pollFeed().catch(console.error);
			},
			3 * 60 * 1000,
		);
	}

	private async pollFeed() {
		let items: RSSItem[];

		try {
			items = await fetchFeed();
		} catch (err) {
			console.error('Error fetching RSS feed:', err);
			return;
		}

		// Load current thread state from DB — one row per thread
		const threadRows = rssDB
			.prepare('SELECT threadID, replyCount, pubDate FROM rss_feed')
			.all() as ThreadRow[];

		const threadState = new Map(
			threadRows.map((r) => [
				r.threadID,
				{ replyCount: r.replyCount, pubDate: r.pubDate },
			]),
		);

		for (const item of items) {
			const threadID = getThreadID(item.link);
			if (!threadID || !allowedThreadIDs.has(threadID)) continue;

			const pubDateMs = item.pubDate ? new Date(item.pubDate).getTime() : null;
			const stored = threadState.get(threadID);

			if (!stored) {
				// First time seeing this thread — store state, no notification
				rssDB
					.prepare(
						'INSERT INTO rss_feed (threadID, title, link, pubDate, replyCount) VALUES (?, ?, ?, ?, ?)',
					)
					.run(
						threadID,
						item.title ?? null,
						item.link ?? null,
						pubDateMs ?? null,
						item.replyCount ?? 0,
					);

				console.log(
					`Tracking new thread: [${threadID}] ${item.title} (${item.replyCount ?? 0} replies)`,
				);

				console.log('----------------------------');
				console.log(`New Reply Detected`);
				console.log(`Thread:   ${item.title}`);
				console.log(`ThreadID: ${threadID}`);
				console.log(`Replies:  ${item.replyCount}`);
				console.log(`Author:   ${item.author}`);
				console.log(`Link:     ${item.link}`);
				console.log(`Preview:  ${item.contentSnippet?.slice(0, 200)}`);
				console.log('----------------------------');
				continue;
			}

			// Detect a new reply: replyCount increased or pubDate is newer
			const replyCountIncreased =
				item.replyCount != null && item.replyCount > stored.replyCount;
			const pubDateNewer =
				pubDateMs != null &&
				stored.pubDate != null &&
				pubDateMs > stored.pubDate;

			if (!replyCountIncreased && !pubDateNewer) continue;

			// Update stored thread state
			rssDB
				.prepare(
					'UPDATE rss_feed SET title = ?, link = ?, pubDate = ?, replyCount = ? WHERE threadID = ?',
				)
				.run(
					item.title ?? null,
					item.link ?? null,
					pubDateMs ?? null,
					item.replyCount ?? stored.replyCount,
					threadID,
				);

			// Update local state map to avoid duplicate notifications within same poll
			threadState.set(threadID, {
				replyCount: item.replyCount ?? stored.replyCount,
				pubDate: pubDateMs ?? stored.pubDate,
			});

			if (!this.initialized) {
				console.log(
					`Skipping historical activity: [${threadID}] ${item.title}`,
				);
				continue;
			}

			const profile = getAuthorProfile(item.author);

			console.log('----------------------------');
			console.log(`New Reply Detected`);
			console.log(`Thread:   ${item.title}`);
			console.log(`ThreadID: ${threadID}`);
			console.log(`Replies:  ${stored.replyCount} → ${item.replyCount}`);
			console.log(`Author:   ${item.author}`);
			console.log(`Profile:  ${profile}`);
			console.log(`Link:     ${item.link}`);
			console.log(`Preview:  ${item.contentSnippet?.slice(0, 200)}`);
			console.log('----------------------------');

			const embed = new EmbedBuilder()
				.setTitle(item.title ?? 'New Post')
				.setURL(item.link ?? '')
				.setColor(0x3498db)
				.setDescription(`New post detected!`)
				.setFooter({
					text: `RPNation Thread Monitor • ${item.replyCount ?? 0} replies`,
				})
				.setTimestamp(pubDateMs ? new Date(pubDateMs) : undefined);

			await this.channel?.send({
				embeds: [embed],
			});
		}

		this.initialized = true;
	}
}

// --------------------------------------------------------
// Types
// --------------------------------------------------------

interface RSSItem {
	guid: string | null;
	title: string | null;
	link: string | null;
	pubDate: string | null;
	author: string | null;
	contentSnippet: string | null;
	replyCount: number | null;
}

interface ThreadRow {
	threadID: string;
	replyCount: number;
	pubDate: number | null;
}

// --------------------------------------------------------
// Feed fetching and parsing
// --------------------------------------------------------

async function fetchFeed(): Promise<RSSItem[]> {
	const res = await fetch(FEED_URL);
	if (!res.ok) throw new Error(`HTTP ${res.status} fetching RSS feed`);
	const text = await res.text();
	return parseFeed(text);
}

function parseFeed(xml: string): RSSItem[] {
	const parsed = xmlParser.parse(xml);
	const rawItems: any[] = parsed?.rss?.channel?.item ?? [];

	return rawItems.map((raw): RSSItem => {
		// Prefer dc:creator, fall back to parsing "email (Username)" author format
		const rawAuthor: string = String(raw['dc:creator'] ?? raw.author ?? '');
		const authorMatch = /\(([^)]+)\)/.exec(rawAuthor);
		const author = authorMatch ? authorMatch[1] : rawAuthor || null;

		// Strip HTML tags from content for snippet
		const rawContent: string = String(raw['content:encoded'] ?? '');
		const contentSnippet = rawContent.replace(/<[^>]*>/g, '').trim() || null;

		// Reply count from slash:comments
		const replyCount =
			raw['slash:comments'] != null
				? parseInt(String(raw['slash:comments']), 10)
				: null;

		return {
			guid: raw.guid != null ? String(raw.guid) : null,
			title: raw.title != null ? String(raw.title) : null,
			link: raw.link != null ? String(raw.link) : null,
			pubDate: raw.pubDate != null ? String(raw.pubDate) : null,
			author,
			contentSnippet,
			replyCount,
		};
	});
}

// --------------------------------------------------------
// Helpers
// --------------------------------------------------------

function getThreadID(url: unknown): string | null {
	const str = String(url ?? '');
	const match = /\/threads\/[^/]+\.(\d+)\//.exec(str);
	return match ? match[1] : null;
}

function getAuthorProfile(author: string | null): string {
	if (!author) return 'https://www.rpnation.com/members/';
	return `https://www.rpnation.com/members/${author.replace(/ /g, '-')}/`;
}
