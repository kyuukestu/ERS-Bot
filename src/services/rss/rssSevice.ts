import Parser from 'rss-parser';
import { rssDB } from '~/database/SQL/database';
import { Client, TextChannel, EmbedBuilder } from 'discord.js';

const parser = new Parser();

const FEED_URL = 'https://www.rpnation.com/forums/-/index.rss';
const CHANNEL_ID = '1479329634792505508';

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

		await this.pollFeed();

		setInterval(
			() => {
				this.pollFeed().catch(console.error);
			},
			3 * 60 * 1000,
		);
	}

	private async pollFeed() {
		let feed;

		try {
			feed = await parser.parseURL(FEED_URL);
		} catch (err) {
			console.error('Error fetching RSS feed:', err);
			return;
		}

		const rows = rssDB
			.prepare('SELECT guid FROM rss_seen ORDER BY pubDate DESC LIMIT 500')
			.all();

		const knownGuids = new Set(rows.map((r: any) => r.guid));

		const items = [...feed.items].reverse();

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
		]);

		for (const item of items) {
			const link = resolveValue(item.link);
			const title = resolveValue(item.title) ?? 'New Post';
			const contentSnippet =
				resolveValue(item['content:encodedSnippet']) ??
				resolveValue(item.contentSnippet) ??
				'New post detected.';

			const threadID = getThreadID(link);
			if (!threadID || !allowedThreadIDs.has(threadID)) continue;

			const guid = getGuid(item);
			if (!guid) continue;
			if (knownGuids.has(guid)) continue;

			const pubDateMs = item.isoDate
				? new Date(item.isoDate).getTime()
				: item.pubDate
					? new Date(item.pubDate).getTime()
					: null;

			rssDB
				.prepare(
					'INSERT OR IGNORE INTO rss_seen (guid, title, link, pubDate) VALUES (?, ?, ?, ?)',
				)
				.run(String(guid), title, link ?? null, pubDateMs ?? null);

			knownGuids.add(guid);

			if (!this.initialized) continue;

			const username = getAuthorName(item);
			const profile = getAuthorProfile(item.author);

			const embed = new EmbedBuilder()
				.setTitle(title)
				.setURL(link ?? '')
				.setColor(0x3498db)
				.setDescription(`${username}\n\n${contentSnippet.slice(0, 200)}`)
				.setFooter({ text: 'RPNation Thread Monitor' })
				.setTimestamp();

			await this.channel?.send({
				content: `${title} - New Reply Detected`,
				embeds: [embed],
			});
		}

		this.initialized = true;
	}
}

function getPostID(url: unknown): string | null {
	console.log('getPostID raw input:', typeof url, url);
	const str = String(url ?? '');
	const match = /post-(\d+)/.exec(str);
	return match ? match[1] : null;
}

function getThreadID(url: unknown): string | null {
	const str = String(url ?? '');
	const match = /\/threads\/[^/]+\.(\d+)\//.exec(str);
	return match ? match[1] : null;
}

function getAuthorName(item: any): string {
	const creator = resolveValue(item['dc:creator']);
	if (creator) return creator;
	// Fallback to parsing author field
	const author = resolveValue(item.author);
	if (!author) return 'Unknown';
	const match = /\(([^)]+)\)/.exec(author);
	return match ? match[1] : author;
}

function getAuthorProfile(author: unknown): string {
	const name = getAuthorName(author);
	return `https://www.rpnation.com/members/${name.replace(/ /g, '-')}/`;
}

function resolveValue(val: unknown): string | null {
	if (!val) return null;
	if (typeof val === 'function') return resolveValue(val());
	if (typeof val === 'string') return val;
	return String(val);
}

function getGuid(item: any): string | null {
	const link = resolveValue(item.link);
	const threadID = getThreadID(link);
	const postID = getPostID(link);

	if (threadID && postID) return `${threadID}:${postID}`;

	// This is the path this feed will usually take
	if (threadID && item.isoDate)
		return `${threadID}:${new Date(item.isoDate).getTime()}`;
	if (threadID && item.pubDate)
		return `${threadID}:${new Date(item.pubDate).getTime()}`;

	try {
		const url = new URL(String(link));
		return url.pathname.replace(/\/$/, '');
	} catch {
		return link;
	}
}
