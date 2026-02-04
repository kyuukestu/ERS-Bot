import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} from 'discord.js';
import type { PokemonList } from '~/types/dexTypes';
/**
 * * This pagination function accepts a list of type 'Pokemon LIST'
 * TODO:  This can maybe be refactored in concert with other Pokemon Lists and then extract as one Pokemon Paginator.
 */

export async function sendPaginatedPokemonEmbed({
	interaction,
	moveName,
	type1,
	type2,
	matches,
}: {
	interaction: ChatInputCommandInteraction;
	moveName: string;
	type1: string | null;
	type2: string | null;
	matches: PokemonList;
}) {
	// ----- config -----
	const PAGE_SIZE = 10;

	// ----- paginate helper -----
	function paginate<T>(items: T[], pageSize: number): T[][] {
		const pages: T[][] = [];
		for (let i = 0; i < items.length; i += pageSize) {
			pages.push(items.slice(i, i + pageSize));
		}
		return pages;
	}

	// ----- main logic -----
	if (matches.length === 0) {
		await interaction.editReply('No Pokémon match that criteria.');
		return;
	}

	const pages = paginate(matches, PAGE_SIZE);
	let currentPage = 0;

	// ----- embed builder -----
	function buildEmbed(page: number) {
		const pageData = pages[page];

		const typeMessage =
			type1 || type2 ? [type1, type2].filter(Boolean).join(' / ') : 'ALL';

		return new EmbedBuilder()
			.setTitle(
				`Pokemon who learn: ${moveName} - Types: ${typeMessage} (${page + 1}/${pages.length})`,
			)
			.setDescription(
				pageData
					.map((p) => `• **${p.name}** (${p.types.join(', ')})`)
					.join('\n'),
			);
	}

	// ----- button row builder -----
	function buildRow(page: number) {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('prev')
				.setLabel('Prev')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 0),

			new ButtonBuilder()
				.setCustomId('next')
				.setLabel('Next')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === pages.length - 1),
		);
	}

	// ----- send initial message -----
	const message = await interaction.editReply({
		embeds: [buildEmbed(currentPage)],
		components: pages.length > 1 ? [buildRow(currentPage)] : [],
	});

	// ----- interaction collector -----
	const collector = message.createMessageComponentCollector({
		time: 60_000,
	});

	collector.on('collect', (i) => {
		if (i.customId === 'prev') currentPage--;
		if (i.customId === 'next') currentPage++;

		i.update({
			embeds: [buildEmbed(currentPage)],
			components: [buildRow(currentPage)],
		});
	});

	collector.on('end', () => {
		message.edit({ components: [] }).catch(() => {});
	});
}
