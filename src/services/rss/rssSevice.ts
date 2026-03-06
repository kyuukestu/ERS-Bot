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
		this.channel = (await this.client.channels.fetch(
			CHANNEL_ID,
		)) as TextChannel;

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

		const knownGuids = new Set(rows.map((r) => r.guid));

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
			const guid = item.guid ?? item.link;
			if (!guid) continue;

			const threadID = getThreadID(item.link);
			if (!threadID || !allowedThreadIDs.has(threadID)) continue;

			if (knownGuids.has(guid)) continue;

			rssDB
				.prepare(
					'INSERT INTO rss_seen (guid, title, link, pubDate) VALUES (?, ?, ?, ?)',
				)
				.run(guid, item.title ?? null, item.link ?? null, item.pubDate ?? null);

			knownGuids.add(guid);

			if (!this.initialized) continue;

			const embed = new EmbedBuilder()
				.setTitle(item.title ?? 'Unknown')
				.setURL(item.link ?? 'Unknown')
				.setColor(0x3498db)
				.setDescription(
					item.contentSnippet?.slice(0, 300) || 'New post detected.',
				)
				.addFields(
					{ name: 'Thread', value: item.thread || 'Unknown', inline: true },
					{ name: 'Author', value: item.author || 'Unknown', inline: true },
				)
				.setFooter({ text: 'RPNation Thread Monitor' })
				.setTimestamp();

			await this.channel?.send({ embeds: [embed] });
		}

		this.initialized = true;
	}
}

function getThreadID(url: string | undefined): string | null {
	if (!url) return null;
	// match the last dot followed by digits before optional slash
	const match = url.match(/\.([0-9]+)\/?$/);
	return match ? match[1] : null;
}
