
import {
	type ChatInputCommandInteraction,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} from 'discord.js';
import type { PokemonList } from '~/types/dexTypes';

interface PokemonPaginationOptions {
	interaction: ChatInputCommandInteraction;
	matches: PokemonList;
	moveName?: string | null;
	abilityName?: string | null;
	type1?: string | null;
	type2?: string | null;
}

export async function sendPaginatedPokemonEmbed({
	interaction,
	matches,
	moveName,
	abilityName,
	type1,
	type2,
}: PokemonPaginationOptions) {
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

	// ----- search criteria -----
	const criteria: string[] = [];

	if (moveName) criteria.push(`Move: ${moveName}`);
	if (abilityName) criteria.push(`Ability: ${abilityName}`);

	const selectedTypes = [type1, type2].filter(
		(type): type is string => Boolean(type),
	);

	if (selectedTypes.length > 0) {
		criteria.push(`Type: ${selectedTypes.join(' / ')}`);
	}

	const criteriaMessage =
		criteria.length > 0 ? criteria.join(' | ') : 'All Pokémon';

	// ----- embed builder -----
	function buildEmbed(page: number) {
		const pageData = pages[page];

		return new EmbedBuilder()
			.setTitle(`Pokémon Search (${page + 1}/${pages.length})`)
			.setDescription(
				[
					`**Criteria:** ${criteriaMessage}`,
					'',
					...pageData.map(
						(p) => `• **${p.name}** (${p.types.join(', ')})`,
					),
				].join('\n'),
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

	collector.on('collect', async (i) => {
		if (i.customId === 'prev') currentPage--;
		if (i.customId === 'next') currentPage++;

		await i.update({
			embeds: [buildEmbed(currentPage)],
			components: [buildRow(currentPage)],
		});
	});

	collector.on('end', () => {
		message.edit({ components: [] }).catch(() => {});
	});
}
