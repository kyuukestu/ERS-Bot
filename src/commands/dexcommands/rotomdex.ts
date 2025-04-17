const { pokemonEndPoint } = require('../../components/api/pokeapi.ts');
const { formatUserInput } = require('../utility/formatUserInput.ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
import type { CommandInteraction } from 'discord.js';
import type { PokemonData } from '../../components/interface/pokemonData.ts';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rotomdex')
		.setDescription('Search for a Pokémon by name and get its information.')
		.addStringOption((option: any) =>
			option
				.setName('name')
				.setDescription('Enter the Pokémon name.')
				.setRequired(true)
		),

	async execute(interaction: CommandInteraction) {
		const pokemonName = formatUserInput(
			interaction.options.get('name', true).value as string
		);

		try {
			// Defer the reply to avoid interaction timeouts
			await interaction.deferReply();

			const data: PokemonData = await pokemonEndPoint(pokemonName);

			// Extract key info
			const name = data.name.toUpperCase();
			const types = data.types.map((t) => t.type.name).join(', ');
			const abilities = data.abilities.map((a) => a.ability.name).join(', ');
			const height = (data.height / 10).toFixed(1); // Convert decimeters to meters
			const weight = (data.weight / 10).toFixed(1); // Convert hectograms to kg
			const stats = data.stats
				.map((s) => `${s.stat.name}: ${s.base_stat}`)
				.join('\n');

			// Extract sprite URLs
			const defaultSprite = data.sprites.front_default;
			const shinySprite = data.sprites.front_shiny;
			const officialArtwork =
				data.sprites.other['official-artwork'].front_default;

			const embed = new EmbedBuilder()
				.setColor('#FFCC00') // Set the embed color
				.setTitle(`📖 Pokédex Entry: ${name}`)
				.setThumbnail(defaultSprite) // Set the official artwork as the thumbnail
				.addFields(
					{ name: 'Type(s)', value: types, inline: true },
					{ name: 'Abilities', value: abilities, inline: true },
					{ name: 'Height', value: `${height} m`, inline: true },
					{ name: 'Weight', value: `${weight} kg`, inline: true },
					{ name: 'Base Stats', value: stats }
				)
				.setImage(officialArtwork) // Set the default sprite as the main image
				.setFooter({
					text: `Requested by ${interaction.user.username}`,
					iconURL: interaction.user.displayAvatarURL(),
				});

			await interaction.editReply({ embeds: [embed] });

			await interaction.followUp({
				content: `**Sprites:**\n- [Default Front](${defaultSprite})\n- [Shiny Front](${shinySprite})`,
			});
		} catch (error) {
			console.error('Error fetching move data:', error);

			// Check if the interaction has already been acknowledged
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(
					`❌ Error: Move "${pokemonName}" not found. Please check the name and try again.`
				);
			} else {
				await interaction.reply(
					`❌ Error: Move "${pokemonName}" not found. Please check the name and try again.`
				);
			}
		}
	},
};
