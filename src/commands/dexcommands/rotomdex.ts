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
} = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { PokemonData } from '../../components/interface/PokemonData.ts';
import type { SpeciesData } from '../../components/interface/SpeciesData.ts';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rotomdex')
		.setDescription('Search for a Pokémon by name and get its information.')
		.addStringOption((option: any) =>
			option
				.setName('name')
				.setDescription('Enter the Pokémon name.')
				.setRequired(true)
		)
		.addStringOption((option: any) =>
			option
				.setName('form')
				.setDescription(`Enter the pokémon's form.`)
				.setRequired(false)
		),

	async execute(interaction: CommandInteraction) {
		const pokemonName = formatUserInput(
			interaction.options.get('name', true).value as string
		);

		let formName = interaction.options.get('form', false)
			? formatUserInput(interaction.options.get('form')?.value as string)
			: '';

		const searchName = formatUserInput(`${pokemonName} ${formName}`);

		try {
			// Defer the reply to avoid interaction timeouts
			await interaction.deferReply();

			const data: PokemonData = await pokemonEndPoint(searchName);
			const species: SpeciesData = await speciesEndPoint(pokemonName);

			// Extract key info
			const name = data.name.toUpperCase();
			const types = data.types.map((t) => t.type.name).join(', ');
			const abilities = data.abilities.map((a) => a.ability.name).join(', ');
			const height = (data.height / 10).toFixed(1); // Convert decimeters to meters
			const weight = (data.weight / 10).toFixed(1); // Convert hectograms to kg
			const stats = data.stats
				.map((s) => `${s.stat.name}: ${s.base_stat}`)
				.join('\n');
			const pokedexNumber = species.pokedex_numbers.filter(
				(pe) => pe.pokedex.name === 'national'
			)[0].entry_number;

			// Extract evolution info
			const evolveFrom = species.evolves_from_species
				? `Evolves from: ${
						species.evolves_from_species.name.charAt(0).toUpperCase() +
						species.evolves_from_species.name.slice(1)
				  }`
				: 'No pre-evolution';

			// Extract egg groups
			const eggGroups = species.egg_groups
				.map((eg) => eg.name.charAt(0).toUpperCase() + eg.name.slice(1))
				.join(', ');

			// Extract English flavor text entries (Pokedex entries)
			const allFlavorTexts: string[] = species.flavor_text_entries
				.filter((ft) => ft.language.name === 'en')
				.map((entry) => {
					const versionName = entry.version.name.toUpperCase();
					const text = entry.flavor_text
						.replace(/\n/g, ' ')
						.replace(/\f/g, ' ');
					return `**${versionName}:** ${text}`;
				});

			// Extract sprite URLs
			const defaultSprite = data.sprites.front_default;
			const shinySprite = data.sprites.front_shiny;
			const officialArtwork =
				data.sprites.other['official-artwork'].front_default;

			const embed = new EmbedBuilder()
				.setColor('#FFCC00') // Set the embed color
				.setTitle(`📖 Pokédex Entry: ${name} (#${pokedexNumber})`)
				.setThumbnail(defaultSprite) // Set the official artwork as the thumbnail
				.addFields(
					{ name: 'Type(s)', value: types, inline: true },
					{ name: 'Abilities', value: abilities, inline: true },
					{ name: 'Height', value: `${height} m`, inline: true },
					{ name: 'Weight', value: `${weight} kg`, inline: true },
					{ name: 'Base Stats', value: stats, inline: false },
					{ name: 'Egg Groups', value: eggGroups, inline: true },
					{ name: 'Evolution', value: evolveFrom, inline: true }
				)
				.setImage(officialArtwork) // Set the default sprite as the main image
				.setFooter({
					text: `Requested by ${interaction.user.username}`,
					iconURL: interaction.user.displayAvatarURL(),
				});

			await interaction.editReply({ embeds: [embed] });

			// Handle Pokedex entries pagination if they exist
			if (allFlavorTexts.length > 0) {
				// Split entries into pages (4 entries per page)
				const pages: string[][] = [];
				const entriesPerPage = 4;

				for (let i = 0; i < allFlavorTexts.length; i += entriesPerPage) {
					pages.push(allFlavorTexts.slice(i, i + entriesPerPage));
				}

				let currentPage = 0;

				// Create buttons for pagination
				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('previous')
						.setLabel('◀')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(true),
					new ButtonBuilder()
						.setCustomId('next')
						.setLabel('▶')
						.setStyle(ButtonStyle.Primary)
						.setDisabled(pages.length <= 1),
					new ButtonBuilder()
						.setCustomId('close')
						.setLabel('✖')
						.setStyle(ButtonStyle.Danger)
				);

				// Create initial entries embed
				const entriesEmbed = new EmbedBuilder()
					.setColor('#0099FF')
					.setTitle(`📚 Pokédex Entries for ${name}`)
					.setDescription(pages[currentPage].join('\n\n'))
					.setFooter({ text: `Page ${currentPage + 1}/${pages.length}` });

				const entriesMessage = await interaction.followUp({
					embeds: [entriesEmbed],
					components: [row],
				});

				// Create collector for button interactions
				const collector = entriesMessage.createMessageComponentCollector({
					time: 30000, // 30 seconds
				});

				collector.on('collect', async (buttonInteraction) => {
					if (buttonInteraction.customId === 'previous') {
						currentPage--;
					} else if (buttonInteraction.customId === 'next') {
						currentPage++;
					} else if (buttonInteraction.customId === 'close') {
						collector.stop();
						await buttonInteraction.update({ components: [] });
						return;
					}
					collector.resetTimer();

					// Update button states
					row.components[0].setDisabled(currentPage === 0);
					row.components[1].setDisabled(currentPage === pages.length - 1);

					// Update embed
					entriesEmbed
						.setDescription(pages[currentPage].join('\n\n'))
						.setFooter({ text: `Page ${currentPage + 1}/${pages.length}` });

					await buttonInteraction.update({
						embeds: [entriesEmbed],
						components: [row],
					});
				});

				collector.on('end', () => {
					entriesMessage.edit({ components: [] }).catch(console.error);
				});
			} else {
				await interaction.followUp({
					content: `No Pokédex entries found for ${name}.`,
				});
			}

			await interaction.followUp({
				content: `**Sprites:**\n- [Default Front](${defaultSprite})\n- [Shiny Front](${shinySprite})`,
			});
		} catch (error) {
			console.error('Error fetching Pokemon Pokemon  data:', error);

			// Check if the interaction has already been acknowledged
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(
					`❌ Error: "${searchName}" not found. Please check the name and try again.`
				);
			} else {
				await interaction.reply(
					`❌ Error: "${searchName}" not found. Please check the name and try again.`
				);
			}
		}
	},
};
