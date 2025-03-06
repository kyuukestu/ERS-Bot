const { PokemonClient } = require('pokenode-ts');
const { SlashCommandBuilder } = require('@discordjs/builders');
import type { CommandInteraction } from 'discord.js';

// Define the structure of the Pokémon data (optional, but recommended for type safety)
interface PokemonData {
	name: string;
	types: { type: { name: string } }[];
	abilities: { ability: { name: string } }[];
	height: number;
	weight: number;
	stats: { stat: { name: string }; base_stat: number }[];
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pokedex')
		.setDescription('Search for a Pokémon by name and get its information.')
		.addStringOption((option: any) =>
			option
				.setName('pokemon')
				.setDescription('Enter the Pokémon name.')
				.setRequired(true)
		),

	async execute(interaction: CommandInteraction) {
		const api = new PokemonClient();
		const pokemonName = interaction.options.get('pokemon', true)
			.value as string; // Use `get` and cast to string

		console.log(`Searching for Pokémon: ${pokemonName}`);

		try {
			const data: PokemonData = await api.getPokemonByName(
				pokemonName.toLowerCase()
			);

			// Extract key info
			const name = data.name.toUpperCase();
			const types = data.types.map((t) => t.type.name).join(', ');
			const abilities = data.abilities.map((a) => a.ability.name).join(', ');
			const height = (data.height / 10).toFixed(1); // Convert decimeters to meters
			const weight = (data.weight / 10).toFixed(1); // Convert hectograms to kg
			const stats = data.stats
				.map((s) => `${s.stat.name}: ${s.base_stat}`)
				.join('\n');

			// Reply with Pokémon details
			await interaction.reply(
				`**📖 Pokédex Entry: ${name}**\n` +
					`**Type(s):** ${types}\n` +
					`**Abilities:** ${abilities}\n` +
					`**Height:** ${height}m\n` +
					`**Weight:** ${weight}kg\n` +
					`**Base Stats:**\n${stats}`
			);
		} catch (error) {
			await interaction.followUp(`❌ Error: ${error}`);
		}
	},
};
