const {
	pokemonEndPoint,
	speciesEndPoint,
} = require('../../components/api/PokeApi.ts');
const {
	formatUserInput,
} = require('../../components/utility/formatUserInput.ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuBuilder,
	ComponentType,
} = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { PokemonData } from '../../components/interface/PokemonData.ts';
import type { SpeciesData } from '../../components/interface/SpeciesData.ts';

// Type effectiveness mapping for better visual representation
const typeColors: { [key: string]: number } = {
	normal: 0xa8a878,
	fire: 0xf08030,
	water: 0x6890f0,
	electric: 0xf8d030,
	grass: 0x78c850,
	ice: 0x98d8d8,
	fighting: 0xc03028,
	poison: 0xa040a0,
	ground: 0xe0c068,
	flying: 0xa890f0,
	psychic: 0xf85888,
	bug: 0xa8b820,
	rock: 0xb8a038,
	ghost: 0x705898,
	dragon: 0x7038f8,
	dark: 0x705848,
	steel: 0xb8b8d0,
	fairy: 0xee99ac,
};

// Stat emojis for better visual appeal
const statEmojis: { [key: string]: string } = {
	hp: '❤️',
	attack: '⚔️',
	defense: '🛡️',
	'special-attack': '✨',
	'special-defense': '🔮',
	speed: '💨',
};

// Generation emojis
const generationEmojis: { [key: number]: string } = {
	1: '1️⃣',
	2: '2️⃣',
	3: '3️⃣',
	4: '4️⃣',
	5: '5️⃣',
	6: '6️⃣',
	7: '7️⃣',
	8: '8️⃣',
	9: '9️⃣',
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rotomdex')
		.setDescription(
			'Search for a Pokémon by name and get comprehensive information.'
		)
		.addStringOption((option: any) =>
			option
				.setName('name')
				.setDescription('Enter the Pokémon name.')
				.setRequired(true)
		)
		.addStringOption((option: any) =>
			option
				.setName('form')
				.setDescription(`Enter the pokémon's form (e.g., alolan, galar).`)
				.setRequired(false)
		)
		.addBooleanOption((option: any) =>
			option
				.setName('shiny')
				.setDescription('Show shiny variant by default.')
				.setRequired(false)
		),

	async execute(interaction: CommandInteraction) {
		const pokemonName = formatUserInput(
			interaction.options.get('name', true).value as string
		);

		let formName = interaction.options.get('form', false)
			? formatUserInput(interaction.options.get('form')?.value as string)
			: '';

		const showShiny =
			(interaction.options.get('shiny', false)?.value as boolean) || false;
		const searchName = formatUserInput(`${pokemonName} ${formName}`);

		try {
			await interaction.deferReply();

			const data: PokemonData = await pokemonEndPoint(searchName);
			const species: SpeciesData = await speciesEndPoint(pokemonName);

			// Enhanced data extraction
			const name = data.name
				.split('-')
				.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
				.join(' ');

			const types = data.types.map(
				(t) =>
					`${getTypeEmoji(t.type.name)} ${
						t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)
					}`
			);

			const abilities = data.abilities.map((a) => {
				const abilityName = a.ability.name
					.split('-')
					.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
					.join(' ');
				return a.is_hidden ? `*${abilityName}* (Hidden)` : abilityName;
			});

			const height = (data.height / 10).toFixed(1);
			const weight = (data.weight / 10).toFixed(1);

			// Aligned stats with emojis and bars starting from the same position
			const maxStatNameLength = Math.max(
				...data.stats.map(
					(s) =>
						s.stat.name
							.split('-')
							.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
							.join(' ').length
				)
			);
			const maxValueLength = 3; // Fixed width for stat values (e.g., 100)
			const statsFormatted = data.stats
				.map((s) => {
					const statName = s.stat.name
						.split('-')
						.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
						.join(' ');
					const emoji = statEmojis[s.stat.name] || '📊';
					const statValue = s.base_stat
						.toString()
						.padStart(maxValueLength, ' ');
					const statBar = createStatBar(s.base_stat);
					const padding = ' '.repeat(
						maxStatNameLength - statName.length + maxValueLength + 2
					); // Extra space after value
					return `${emoji} **${statName}:** ${statValue}${padding}${statBar}`;
				})
				.join('\n');

			const totalStats = data.stats.reduce(
				(sum, stat) => sum + stat.base_stat,
				0
			);

			const pokedexNumber =
				species.pokedex_numbers.filter(
					(pe) => pe.pokedex.name === 'national'
				)[0]?.entry_number || 'Unknown';

			// Enhanced evolution info
			const evolveFrom = species.evolves_from_species
				? `⬅️ Evolves from: **${
						species.evolves_from_species.name.charAt(0).toUpperCase() +
						species.evolves_from_species.name.slice(1)
				  }**`
				: '🥚 Base form';

			// Aligned breeding and capture info
			const eggGroups =
				species.egg_groups.length > 0
					? species.egg_groups
							.map((eg) => eg.name.charAt(0).toUpperCase() + eg.name.slice(1))
							.join(', ')
					: 'Unknown';

			const generation =
				species.generation?.name.replace('generation-', '') || 'unknown';
			const genNumber = parseInt(generation.split('-')[0]) || 0;
			const genEmoji = generationEmojis[genNumber] || '❓';

			const habitat = species.habitat
				? species.habitat.name.charAt(0).toUpperCase() +
				  species.habitat.name.slice(1)
				: 'Unknown';

			const growthRate =
				species.growth_rate?.name
					.split('-')
					.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
					.join(' ') || 'Unknown';

			const captureRate = species.capture_rate || 0;
			const captureRatePercentage = ((captureRate / 255) * 100).toFixed(1);

			// Aligned breeding and capture fields
			const maxLabelLength = Math.max(
				'Egg Groups:'.length,
				'Growth Rate:'.length,
				'Capture Rate:'.length,
				'Habitat:'.length
			);
			const breedingFormatted = [
				`**${'Egg Groups:'.padEnd(maxLabelLength, ' ')}** ${eggGroups}`,
				`**${'Growth Rate:'.padEnd(maxLabelLength, ' ')}** ${growthRate}`,
			].join('\n');
			const captureFormatted = [
				`**${'Capture Rate:'.padEnd(
					maxLabelLength,
					' '
				)}** ${captureRate}/255 (${captureRatePercentage}%)`,
				`**${'Habitat:'.padEnd(maxLabelLength, ' ')}** ${habitat}`,
			].join('\n');

			// Enhanced sprite selection
			const sprites = {
				default: showShiny
					? data.sprites.front_shiny
					: data.sprites.front_default,
				shiny: data.sprites.front_shiny,
				back: showShiny ? data.sprites.back_shiny : data.sprites.back_default,
				backShiny: data.sprites.back_shiny,
				officialArtwork: data.sprites.other['official-artwork']?.front_default,
				shinyArtwork: data.sprites.other['official-artwork']?.front_shiny,
				dreamWorld: data.sprites.other.dream_world?.front_default,
			};

			// Main color based on primary type
			const primaryType = data.types[0].type.name;
			const embedColor = typeColors[primaryType] || 0xffcc00;

			// Create main embed with aligned layout
			const mainEmbed = new EmbedBuilder()
				.setColor(embedColor)
				.setTitle(
					`${genEmoji} **${name}** ${showShiny ? '✨' : ''} (#${pokedexNumber})`
				)
				.setThumbnail(sprites.default || sprites.officialArtwork)
				.setImage(sprites.officialArtwork || sprites.default)
				.addFields(
					{
						name: '🏷️ Types',
						value: types.join(' '),
						inline: true,
					},
					{
						name: '🎯 Abilities',
						value: abilities.join('\n'),
						inline: true,
					},
					{
						name: '📏 Physical',
						value: `**Height:** ${height} m\n**Weight:** ${weight} kg`,
						inline: true,
					},
					{
						name: '📊 Base Stats',
						value: `${statsFormatted}\n**Total:** ${totalStats
							.toString()
							.padStart(3, ' ')}`,
						inline: false,
					},
					{
						name: '🥚 Breeding',
						value: breedingFormatted,
						inline: true,
					},
					{
						name: '🎣 Capture Info',
						value: captureFormatted,
						inline: true,
					},
					{
						name: '🧬 Evolution',
						value: evolveFrom,
						inline: true,
					}
				)
				.setFooter({
					text: `Requested by ${interaction.user.username} • Generation ${genNumber}`,
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
						label: '🔄 Move Learnset',
						description: 'Moves this Pokémon can learn',
						value: 'moves',
						emoji: '⚡',
					},
				]);

			const actionRow = new ActionRowBuilder().addComponents(selectMenu);

			await interaction.editReply({
				embeds: [mainEmbed],
				components: [actionRow],
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
						await handlePokedexEntries(selectInteraction, species, name);
						break;
					case 'sprite_gallery':
						await handleSpriteGallery(
							selectInteraction,
							sprites,
							name,
							showShiny
						);
						break;
					case 'type_effectiveness':
						await handleTypeEffectiveness(selectInteraction, data.types, name);
						break;
					case 'locations':
						await handleLocations(selectInteraction, data.id, name);
						break;
					case 'moves':
						await handleMoves(selectInteraction, data.moves, name);
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
						'• Try using the exact Pokémon name\n• For forms, use: `pikachu` with form: `alola`\n• Check for typos in the name',
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
function getTypeEmoji(type: string): string {
	const typeEmojis: { [key: string]: string } = {
		normal: '⚪',
		fire: '🔥',
		water: '💧',
		electric: '⚡',
		grass: '🌿',
		ice: '❄️',
		fighting: '👊',
		poison: '☠️',
		ground: '🌍',
		flying: '🌪️',
		psychic: '🔮',
		bug: '🐛',
		rock: '🗿',
		ghost: '👻',
		dragon: '🐉',
		dark: '🌑',
		steel: '⚙️',
		fairy: '🧚',
	};
	return typeEmojis[type] || '❓';
}

function createStatBar(stat: number): string {
	const maxStat = 255; // Approximate max base stat
	const percentage = Math.min(stat / maxStat, 1);
	const filledBars = Math.floor(percentage * 10);
	const emptyBars = 10 - filledBars;
	return '█'.repeat(filledBars) + '░'.repeat(emptyBars);
}

async function handlePokedexEntries(
	interaction: any,
	species: SpeciesData,
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
		components: [row],
		ephemeral: true,
	});

	const entriesCollector = entriesMessage.createMessageComponentCollector({
		time: 120000, // 2 minutes
	});

	entriesCollector.on('collect', async (buttonInteraction: any) => {
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
		row.components[0].setDisabled(currentPage === 0);
		row.components[1].setDisabled(currentPage === pages.length - 1);

		await buttonInteraction.update({
			embeds: [createEntriesEmbed(currentPage)],
			components: [row],
		});
	});

	entriesCollector.on('end', () => {
		entriesMessage.edit({ components: [] }).catch(console.error);
	});
}

async function handleSpriteGallery(
	interaction: any,
	sprites: any,
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
		components: [spriteRow],
		ephemeral: true,
	});

	const spriteCollector = spriteMessage.createMessageComponentCollector({
		time: 120000,
	});

	spriteCollector.on('collect', async (selectInteraction: any) => {
		currentSprite = selectInteraction.values[0];

		// Update select menu defaults
		spriteSelect.options.forEach((option) => {
			option.setDefault(option.data.value === currentSprite);
		});

		await selectInteraction.update({
			embeds: [createSpriteEmbed(currentSprite)],
			components: [new ActionRowBuilder().addComponents(spriteSelect)],
		});
	});

	spriteCollector.on('end', () => {
		spriteMessage.edit({ components: [] }).catch(console.error);
	});
}

// Additional helper functions for type effectiveness, locations, and moves
async function handleTypeEffectiveness(
	interaction: any,
	types: any[],
	name: string
) {
	// Placeholder for type effectiveness chart
	const typeEmbed = new EmbedBuilder()
		.setColor(0x9b59b6)
		.setTitle(`⚔️ Type Effectiveness for ${name}`)
		.setDescription(
			'This feature requires additional type effectiveness data from the API.'
		)
		.addFields({
			name: 'Types',
			value: types
				.map((t) => `${getTypeEmoji(t.type.name)} ${t.type.name}`)
				.join(' '),
			inline: true,
		});

	await interaction.followUp({ embeds: [typeEmbed], ephemeral: true });
}

async function handleLocations(
	interaction: any,
	pokemonId: number,
	name: string
) {
	// Placeholder for location data
	const locationEmbed = new EmbedBuilder()
		.setColor(0x27ae60)
		.setTitle(`📍 Locations for ${name}`)
		.setDescription(
			'This feature requires additional location data from the API.'
		);

	await interaction.followUp({ embeds: [locationEmbed], ephemeral: true });
}

async function handleMoves(interaction: any, moves: any[], name: string) {
	// Placeholder for move data with basic info
	const moveCount = moves.length;
	const moveEmbed = new EmbedBuilder()
		.setColor(0xf39c12)
		.setTitle(`⚡ Moves for ${name}`)
		.setDescription(`${name} can learn ${moveCount} different moves.`)
		.addFields({
			name: 'Sample Moves',
			value:
				moves
					.slice(0, 10)
					.map((m) =>
						m.move.name
							.split('-')
							.map(
								(part: string) => part.charAt(0).toUpperCase() + part.slice(1)
							)
							.join(' ')
					)
					.join(', ') + (moveCount > 10 ? '...' : ''),
			inline: false,
		});

	await interaction.followUp({ embeds: [moveEmbed], ephemeral: true });
}
