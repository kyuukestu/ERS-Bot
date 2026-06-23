import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	ComponentType,
	MessageFlags,
	type ButtonInteraction,
} from 'discord.js';
import type { ParsedSpeciesData } from '~/api/z-schemas/apiSchemas.ts';
import { typeColors } from '~/ui/colors.ts';
import { getPrimaryType } from '~/services/dex/pokemonService.ts';
import type {
	PokemonInfo,
	PokemonSprites,
	SpeciesInfo,
} from '~/services/dex/pokemonService.ts';

export const buildPokemonEmbed = (
	pokemonInfo: PokemonInfo,
	speciesInfo: SpeciesInfo,
	breedingFormatted: string,
	captureFormatted: string,
	sprites: PokemonSprites,
	totalStats: number,
	showShiny: boolean,
	username: string,
	avatarURL: string,
	matchSummary: string,
) => {
	const embedColor = typeColors[getPrimaryType(pokemonInfo)] || 0xffcc00;

	const types = pokemonInfo.types.length
		? pokemonInfo.types
				.map((type) => `**${type.charAt(0).toUpperCase() + type.slice(1)}**`)
				.join(' | ')
		: 'Unknown';

	const abilities = pokemonInfo.abilities.length
		? pokemonInfo.abilities
				.map(
					(ability) =>
						`> ${ability.charAt(0).toUpperCase() + ability.slice(1)}`,
				)
				.join('\n')
		: 'None';

	return new EmbedBuilder()
		.setColor(embedColor)
		.setTitle(
			`# ${speciesInfo.gen_emoji} **${pokemonInfo.name}** ${
				showShiny ? '✨' : ''
			} (#${speciesInfo.pokedex_numbers})`,
		)
		.setThumbnail(sprites.default || sprites.officialArtwork)
		.addFields(
			{ name: '** 🏷️ TYPES**', value: types, inline: true },
			{ name: '** 🎯 ABILITIES**', value: abilities, inline: true },
			{ name: '** 📊 MATCHES**', value: matchSummary, inline: false },
			{
				name: '** 📏 PHYSICAL **',
				value: `> **Height:** ${pokemonInfo.height} m\n**Weight:** ${pokemonInfo.weight} kg`,
				inline: false,
			},
			{ name: '** 🥚 BREEDING **', value: breedingFormatted, inline: false },
			{ name: '** 🎣 CAPTURE INFO**', value: captureFormatted, inline: false },
			{
				name: '** 🧬 EVOLUTION**',
				value: speciesInfo.evolves_from_species,
				inline: false,
			},
			{
				name: '** 📊 BASE STAT TOTAL**',
				value: `**🎯 ${totalStats}**`,
				inline: false,
			},
		)
		.setImage('attachment://pokemon-stats.png')
		.setFooter({
			text: `Requested by ${username} • Generation ${speciesInfo.generation_num}`,
			iconURL: avatarURL,
		})
		.setTimestamp();
};

export const buildPokemonViewActionRow = (hasSpriteGallery: boolean) => {
	const pokedexButton = new ButtonBuilder()
		.setCustomId('pokedex_entries')
		.setLabel('📖 Pokédex Entries')
		.setStyle(ButtonStyle.Primary)
		.setEmoji('📚');

	const galleryButton = new ButtonBuilder()
		.setCustomId('sprite_gallery')
		.setLabel('🖼️ Sprite Gallery')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji('🎨')
		.setDisabled(!hasSpriteGallery);

	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		pokedexButton,
		galleryButton,
	);
};

export const buildPokemonMatchSummary = (
	bestMatch: string,
	otherMatches: Array<{ speciesName?: string }>,
) => {
	if (otherMatches.length === 0) {
		return `Best Match: ${bestMatch}\nNo alternate matches found.`;
	}

	const displayedMatches = otherMatches
		.slice(0, 3)
		.map((match) => match.speciesName ?? 'Unknown')
		.join(', ');

	return `Best Match: ${bestMatch}\n${otherMatches.length} alternate match${
		otherMatches.length === 1 ? '' : 'es'
	} found. Examples: ${displayedMatches}${
		otherMatches.length > 3 ? `, and ${otherMatches.length - 3} more.` : ''
	}`;
};

export const handlePokedexEntries = async (
	interaction: ButtonInteraction,
	species: ParsedSpeciesData,
	name: string,
) => {
	const allFlavorTexts = species.flavor_text_entries
		.filter((entry) => entry.language?.name === 'en')
		.map((entry) => {
			const versionName = entry.version.name.toUpperCase().replace(/-/g, ' ');

			const text = entry.flavor_text
				.replace(/\n|\f/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();

			return `**${versionName}:** ${text}`;
		});

	if (allFlavorTexts.length === 0) {
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(0xff6b6b)
					.setTitle('📚 No Pokédex Entries Found')
					.setDescription(`No English entries available for ${name}.`),
			],
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	const pages: string[][] = [];
	const entriesPerPage = 3;

	for (let i = 0; i < allFlavorTexts.length; i += entriesPerPage) {
		pages.push(allFlavorTexts.slice(i, i + entriesPerPage));
	}

	let currentPage = 0;

	const buildEmbed = (page: number) =>
		new EmbedBuilder()
			.setColor(0x4ecdc4)
			.setTitle(`📚 Pokédex Entries for ${name}`)
			.setDescription(pages[page].join('\n\n'))
			.setFooter({
				text: `Page ${page + 1}/${pages.length} • ${allFlavorTexts.length} entries`,
			});

	const buildRow = () =>
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('entries_prev')
				.setLabel('◀ Previous')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentPage === 0),

			new ButtonBuilder()
				.setCustomId('entries_next')
				.setLabel('Next ▶')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentPage === pages.length - 1),

			new ButtonBuilder()
				.setCustomId('entries_close')
				.setLabel('Close')
				.setStyle(ButtonStyle.Danger)
				.setEmoji('✖️'),
		);

	const message = await interaction.reply({
		embeds: [buildEmbed(currentPage)],
		components: [buildRow()],
		flags: MessageFlags.Ephemeral,
		fetchReply: true,
	});

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		filter: (btn) => btn.user.id === interaction.user.id,
		time: 120000,
	});

	collector.on('collect', async (i) => {
		switch (i.customId) {
			case 'entries_prev':
				currentPage = Math.max(0, currentPage - 1);
				break;

			case 'entries_next':
				currentPage = Math.min(pages.length - 1, currentPage + 1);
				break;

			case 'entries_close':
				collector.stop('closed');
				await i.update({ components: [] });
				return;
		}

		await i.update({
			embeds: [buildEmbed(currentPage)],
			components: [buildRow()],
		});
	});

	collector.on('end', async () => {
		try {
			await message.edit({ components: [] });
		} catch {
			// message may already be gone
		}
	});
};
