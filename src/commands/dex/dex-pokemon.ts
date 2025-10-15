import {
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandBooleanOption,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuBuilder,
	ComponentType,
	type ChatInputCommandInteraction,
	type StringSelectMenuInteraction,
	type ButtonInteraction,
	MessageFlags,
} from 'discord.js';
import type { ParsedSpeciesData } from '../../schemas/apiSchemas.ts';
// import type { PokemonData, SpeciesData } from '../../interface/apiData.ts';
import { typeColors } from '../../ui/colors.ts';
import { pokemonEndPoint, speciesEndPoint } from '../../api/pokeapi.ts';
import { formatUserInput } from '../../utility/formatting/formatUserInput.ts';
import { PokemonStatsCanvas } from '../../utility/statsCanvas.ts';
import { type PokemonStats } from '../../interface/canvasData.ts';
import { extractPokemonInfo } from '../../utility/dataExtraction/extractPokemonInfo.ts';
import { extractSpeciesInfo } from '../../utility/dataExtraction/extractSpeciesInfo.ts';
import { matchPokemonSpecies } from '../../utility/fuzzy-search.ts';

interface PokemonSprites {
	default: string | null;
	shiny: string | null;
	back: string | null;
	backShiny: string | null;
	officialArtwork: string | null;
	shinyArtwork: string | null;
	dreamWorld: string | null;
}

export default {
	data: new SlashCommandBuilder()
		.setName('dex-pokemon')
		.setDescription('Provides pokedex-like information about a Pokémon.')
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('name')
				.setDescription('Enter the Pokémon name.')
				.setRequired(true)
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('form')
				.setDescription(`Enter the pokémon's form (e.g., alolan, galar).`)
				.setRequired(false)
		)
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('shiny')
				.setDescription('Show shiny variant by default.')
				.setRequired(false)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const pokemonName = formatUserInput(
			interaction.options.get('name', true).value as string
		);

		const form = interaction.options.get('form', false)
			? formatUserInput(interaction.options.get('form')?.value as string)
			: '';

		const showShiny =
			(interaction.options.get('shiny', false)?.value as boolean) || false;
		const searchName = formatUserInput(`${pokemonName} ${form}`);

		try {
			await interaction.deferReply();

			const { speciesName, formName } = await matchPokemonSpecies(
				`${pokemonName}-${form}`
			);

			const apiName = formName || speciesName;

			console.log(`Matched Name: ${speciesName}; Matched Form: ${formName}`);

			const testNames = async () => {
				try {
					return await pokemonEndPoint(apiName);
				} catch {
					return await pokemonEndPoint(speciesName);
				}
			};

			const pokemonInfo = extractPokemonInfo(await testNames());
			const speciesInfo = extractSpeciesInfo(
				await speciesEndPoint(speciesName)
			);

			// TODO: Implement check for cases in which the pokemon endpoint passes but the speceis end-point does not.

			// Aligned breeding and capture fields
			const maxLabelLength = Math.max(
				'Egg Groups:'.length,
				'Growth Rate:'.length,
				'Capture Rate:'.length,
				'Habitat:'.length
			);
			const breedingFormatted = [
				`**${'Egg Groups:'.padEnd(maxLabelLength, ' ')}** ${
					speciesInfo.egg_groups
				}`,
				`**${'Growth Rate:'.padEnd(maxLabelLength, ' ')}** ${
					speciesInfo.growth_rate
				}`,
			].join('\n');
			const captureFormatted = [
				`**${'Capture Rate:'.padEnd(maxLabelLength, ' ')}** ${
					speciesInfo.capture_rate
				}/255 (${speciesInfo.capture_percentage}%)`,
				`**${'Habitat:'.padEnd(maxLabelLength, ' ')}** ${speciesInfo.habitat}`,
			].join('\n');

			// Enhanced sprite selection
			const sprites = {
				default: showShiny
					? pokemonInfo.sprites.front_shiny
					: pokemonInfo.sprites.front_default,
				shiny: pokemonInfo.sprites.front_shiny,
				back: showShiny
					? pokemonInfo.sprites.back_shiny
					: pokemonInfo.sprites.back_default,
				backShiny: pokemonInfo.sprites.back_shiny,
				officialArtwork:
					pokemonInfo.sprites.other['official-artwork']?.front_default,
				shinyArtwork:
					pokemonInfo.sprites.other['official-artwork']?.front_shiny,
				dreamWorld: pokemonInfo.sprites.other.dream_world?.front_default,
			};

			// Main color based on primary type
			const primaryType = pokemonInfo.types[0];
			const embedColor = typeColors[primaryType] || 0xffcc00;

			const stats: PokemonStats = {
				hp:
					pokemonInfo.stats.find(
						(s: { stat: { name: string }; base_stat: number }) =>
							s.stat.name === 'hp'
					)?.base_stat || 0,
				attack:
					pokemonInfo.stats.find(
						(s: { stat: { name: string }; base_stat: number }) =>
							s.stat.name === 'attack'
					)?.base_stat || 0,
				defense:
					pokemonInfo.stats.find(
						(s: { stat: { name: string }; base_stat: number }) =>
							s.stat.name === 'defense'
					)?.base_stat || 0,
				spAttack:
					pokemonInfo.stats.find(
						(s: { stat: { name: string }; base_stat: number }) =>
							s.stat.name === 'special-attack'
					)?.base_stat || 0,
				spDefense:
					pokemonInfo.stats.find(
						(s: { stat: { name: string }; base_stat: number }) =>
							s.stat.name === 'special-defense'
					)?.base_stat || 0,
				speed:
					pokemonInfo.stats.find(
						(s: { stat: { name: string }; base_stat: number }) =>
							s.stat.name === 'speed'
					)?.base_stat || 0,
			};

			// Create stats visualization
			const statsImage = PokemonStatsCanvas.createStatsImage(stats, {
				backgroundColor: '#36393F',
				borderColor: '#72767D',
				width: 500,
				height: 280,
			});

			// Calculate total stats
			const totalStats = Object.values(stats).reduce(
				(sum, stat) => sum + stat,
				0
			);

			// Create main embed with aligned layout
			const mainEmbed = new EmbedBuilder()
				.setColor(embedColor)
				.setTitle(
					`# ${speciesInfo.gen_emoji} **${pokemonInfo.name}** ${
						showShiny ? '✨' : ''
					} (#${speciesInfo.pokedex_numbers})`
				)
				.setThumbnail(sprites.default || sprites.officialArtwork)
				.setImage(sprites.officialArtwork || sprites.default)
				.addFields(
					// Row 1: Types and Abilities (inline, 2 per row)
					{
						name: '** 🏷️ TYPES**',
						value:
							pokemonInfo.types.length > 0
								? pokemonInfo.types
										.map((t) => `**${t.charAt(0).toUpperCase() + t.slice(1)}**`)
										.join(' | ')
								: 'Unknown',
						inline: true,
					},
					{
						name: '** 🎯 ABILITIES**',
						value:
							pokemonInfo.abilities.length > 0
								? pokemonInfo.abilities
										.map((a) => `> ${a.charAt(0).toUpperCase() + a.slice(1)}`)
										.join('\n')
								: 'None',
						inline: true,
					},

					// Row 2: Physical stats (full width)
					{
						name: '**📏 PHYSICAL **',
						value: `> **Height:** ${pokemonInfo.height} m\n**Weight:** ${pokemonInfo.weight} kg`,
						inline: false,
					},

					// Row 4: Breeding info (full width, bullet style)
					{
						name: '** 🥚 BREEDING **',
						value:
							breedingFormatted.length > 0
								? breedingFormatted
										.split('\n')
										.map((line) => `> ${line}`)
										.join('\n')
								: 'Unknown',
						inline: false,
					},

					// Row 5: Capture info (full width, bullet style)
					{
						name: '** 🎣 CAPTURE INFO**',
						value:
							captureFormatted.length > 0
								? captureFormatted
										.split('\n')
										.map((line) => `> ${line}`)
										.join('\n')
								: 'Unknown',
						inline: false,
					},

					// Row 6: Evolution (full width)
					{
						name: '** 🧬 EVOLUTION**',
						value: speciesInfo.evolves_from_species,
						inline: false,
					},

					// Row 3: Base Stat Total (full width)
					{
						name: '** 📊 BASE STAT TOTAL**',
						value: `**🎯 ${totalStats}**`,
						inline: false,
					}
				)
				.setImage('attachment://pokemon-stats.png')
				.setFooter({
					text: `Requested by ${interaction.user.username} • Generation ${speciesInfo.generation_num}`,
					iconURL: interaction.user.displayAvatarURL(),
				})
				.setTimestamp();

			// Create interactive menu for different views
			const selectMenu = new StringSelectMenuBuilder()
				.setCustomId('pokemon_view')
				.setPlaceholder('Choose what to view...')
				.addOptions([
					{
						label: '📖 Pokédex Entries',
						description: 'View flavor text from different games',
						value: 'pokedex_entries',
						emoji: '📚',
					},
					{
						label: '🖼️ Sprite Gallery',
						description: 'Browse different sprites and artwork',
						value: 'sprite_gallery',
						emoji: '🎨',
					},
					{
						label: '⚔️ Type Effectiveness',
						description: 'View type advantages and weaknesses',
						value: 'type_effectiveness',
						emoji: '🛡️',
					},
					{
						label: '📍 Game Locations',
						description: 'Where to find this Pokémon',
						value: 'locations',
						emoji: '🗺️',
					},
					{
						label: '🔄 Move Learn-set',
						description: 'Moves this Pokémon can learn',
						value: 'moves',
						emoji: '⚡',
					},
				]);

			const actionRow = new ActionRowBuilder().addComponents(selectMenu);

			await interaction.editReply({
				embeds: [mainEmbed],
				components: [actionRow.toJSON()],
				files: [statsImage],
			});

			// Handle menu interactions
			const collector = interaction.channel?.createMessageComponentCollector({
				filter: (i) => i.user.id === interaction.user.id,
				time: 300000, // 5 minutes
				componentType: ComponentType.StringSelect,
			});

			collector?.on('collect', async (selectInteraction) => {
				await selectInteraction.deferUpdate();

				switch (selectInteraction.values[0]) {
					case 'pokedex_entries':
						await handlePokedexEntries(
							selectInteraction,
							speciesInfo,
							pokemonInfo.name
						);
						break;
					case 'sprite_gallery':
						await handleSpriteGallery(
							selectInteraction,
							sprites,
							pokemonInfo.name,
							showShiny
						);
						break;
				}
			});

			collector?.on('end', () => {
				interaction.editReply({ components: [] }).catch(console.error);
			});
		} catch (error) {
			console.error('Error fetching Pokemon data:', error);

			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('❌ Pokémon Not Found')
				.setDescription(
					`Could not find a Pokémon named "${searchName}". Please check the spelling and try again.`
				)
				.addFields({
					name: '💡 Tips',
					value:
						'• Try using the exact Pokémon name\n• For forms, use: `Pikachu` with form: `Alola`\n• Check for typos in the name',
				});

			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({ embeds: [errorEmbed] });
			} else {
				await interaction.reply({ embeds: [errorEmbed] });
			}
		}
	},
};

// Helper functions
async function handlePokedexEntries(
	interaction: StringSelectMenuInteraction,
	species: ParsedSpeciesData,
	name: string
) {
	const allFlavorTexts = species.flavor_text_entries
		.filter((ft) => ft.language.name === 'en')
		.map((entry) => {
			const versionName = entry.version.name.toUpperCase().replace('-', ' ');
			const text = entry.flavor_text
				.replace(/\n|\f/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();
			return `**${versionName}:** ${text}`;
		});

	if (allFlavorTexts.length === 0) {
		const noEntriesEmbed = new EmbedBuilder()
			.setColor(0xff6b6b)
			.setTitle(`📚 No Pokédex Entries Found`)
			.setDescription(`No English Pokédex entries available for ${name}.`);

		await interaction.followUp({ embeds: [noEntriesEmbed], ephemeral: true });
		return;
	}

	// Pagination logic for entries
	const pages: string[][] = [];
	const entriesPerPage = 3;

	for (let i = 0; i < allFlavorTexts.length; i += entriesPerPage) {
		pages.push(allFlavorTexts.slice(i, i + entriesPerPage));
	}

	let currentPage = 0;

	const createEntriesEmbed = (page: number) => {
		return new EmbedBuilder()
			.setColor(0x4ecdc4)
			.setTitle(`📚 Pokédex Entries for ${name}`)
			.setDescription(pages[page].join('\n\n'))
			.setFooter({
				text: `Page ${page + 1} of ${pages.length} • ${
					allFlavorTexts.length
				} total entries`,
			});
	};

	// Create pagination buttons
	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('entries_prev')
			.setLabel('◀ Previous')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(currentPage === 0),
		new ButtonBuilder()
			.setCustomId('entries_next')
			.setLabel('Next ▶')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(pages.length <= 1),
		new ButtonBuilder()
			.setCustomId('entries_close')
			.setLabel('Close')
			.setStyle(ButtonStyle.Danger)
			.setEmoji('✖️')
	);

	const entriesMessage = await interaction.followUp({
		embeds: [createEntriesEmbed(currentPage)],
		components: [row.toJSON()],
		flags: MessageFlags.Ephemeral,
	});

	const entriesCollector = entriesMessage.createMessageComponentCollector({
		time: 120000, // 2 minutes
	});

	entriesCollector.on(
		'collect',
		async (buttonInteraction: ButtonInteraction) => {
			if (buttonInteraction.customId === 'entries_prev') {
				currentPage = Math.max(0, currentPage - 1);
			} else if (buttonInteraction.customId === 'entries_next') {
				currentPage = Math.min(pages.length - 1, currentPage + 1);
			} else if (buttonInteraction.customId === 'entries_close') {
				entriesCollector.stop();
				await buttonInteraction.update({ components: [] });
				return;
			}

			// Update button states
			(row.components[0] as ButtonBuilder).setDisabled(currentPage === 0);
			(row.components[1] as ButtonBuilder).setDisabled(
				currentPage === pages.length - 1
			);

			await buttonInteraction.update({
				embeds: [createEntriesEmbed(currentPage)],
				components: [row.toJSON()],
			});
		}
	);

	entriesCollector.on('end', () => {
		entriesMessage.edit({ components: [] }).catch(console.error);
	});
}

async function handleSpriteGallery(
	interaction: StringSelectMenuInteraction,
	sprites: PokemonSprites,
	name: string,
	currentlyShiny: boolean
) {
	const spriteOptions = [
		{ label: 'Default Front', value: 'default', sprite: sprites.default },
		{ label: 'Shiny Front', value: 'shiny', sprite: sprites.shiny },
		{ label: 'Default Back', value: 'back', sprite: sprites.back },
		{ label: 'Shiny Back', value: 'backShiny', sprite: sprites.backShiny },
		{
			label: 'Official Artwork',
			value: 'artwork',
			sprite: sprites.officialArtwork,
		},
		{
			label: 'Shiny Artwork',
			value: 'shinyArtwork',
			sprite: sprites.shinyArtwork,
		},
		{ label: 'Dream World', value: 'dreamWorld', sprite: sprites.dreamWorld },
	].filter((option) => option.sprite); // Only include available sprites

	let currentSprite = currentlyShiny ? 'shiny' : 'default';

	const createSpriteEmbed = (spriteKey: string) => {
		const option = spriteOptions.find((opt) => opt.value === spriteKey);
		return new EmbedBuilder()
			.setColor(0xff9999)
			.setTitle(`🎨 ${name} - ${option?.label || 'Sprite Gallery'}`)
			.setImage(option?.sprite || sprites.default)
			.setFooter({
				text: `Viewing: ${option?.label || 'Unknown'} • ${
					spriteOptions.length
				} sprites available`,
			});
	};

	const spriteSelect = new StringSelectMenuBuilder()
		.setCustomId('sprite_select')
		.setPlaceholder('Choose a sprite to view...')
		.addOptions(
			spriteOptions.map((option) => ({
				label: option.label,
				value: option.value,
				description: `View ${option.label.toLowerCase()}`,
				default: option.value === currentSprite,
			}))
		);

	const spriteRow = new ActionRowBuilder().addComponents(spriteSelect);

	const spriteMessage = await interaction.followUp({
		embeds: [createSpriteEmbed(currentSprite)],
		components: [spriteRow.toJSON()],
		flags: MessageFlags.Ephemeral,
	});

	const spriteCollector = spriteMessage.createMessageComponentCollector({
		time: 120000,
	});

	spriteCollector.on(
		'collect',
		async (selectInteraction: StringSelectMenuInteraction) => {
			currentSprite = selectInteraction.values[0];

			// Update select menu defaults
			spriteSelect.options.forEach((option) => {
				option.setDefault(option.data.value === currentSprite);
			});

			await selectInteraction.update({
				embeds: [createSpriteEmbed(currentSprite)],
				components: [
					new ActionRowBuilder().addComponents(spriteSelect).toJSON(),
				],
			});
		}
	);

	spriteCollector.on('end', () => {
		spriteMessage.edit({ components: [] }).catch(console.error);
	});
}
