import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import OC from '../../../models/OCSchema';
import { type PokemonDocument } from '../../../models/PokemonSchema';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-oc-party')
		.setDescription('Displays your OCs party.')
		.addStringOption((option) =>
			option
				.setName('oc-name')
				.setDescription('Your registered ocs name')
				.setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const OCName = interaction.options.getString('oc-name');

		try {
			const targetOC = await OC.findOne({ name: OCName }).populate<{
				pokemon: PokemonDocument;
			}>('party.pokemon');

			if (!targetOC) return interaction.reply(`${OCName} does not exist.`);

			// Loop through each Pokémon in the party
			const partyInfo = targetOC.party
				.map((entry) => {
					// entry.pokemon is populated (PokemonDocument)
					const pokemonDoc = entry.pokemon as PokemonDocument | null;
					if (!pokemonDoc) return null; // safety check

					return {
						nickname: entry.nickname || pokemonDoc.nickname || null,
						species: entry.species || pokemonDoc.species,
						level: entry.level || pokemonDoc.level,
						drain: entry.drain || pokemonDoc.fortitude_drain,
						gender: pokemonDoc.gender,
						ability: pokemonDoc.ability,
						bst: pokemonDoc.bst,
						// you can add more info from the Pokemon document if needed
					};
				})
				.filter(Boolean); // remove any nulls

			let totalDrain = 0;
			// Example: create a formatted string for display
			let displayString = `# **${OCName}'s Party:**\n`;
			partyInfo.forEach((p, idx) => {
				displayString += `## ${idx + 1}. ${p?.nickname || p?.species}`;
				displayString += `Species: ${p?.species.toUpperCase()}\t ${p?.ability.join(
					', '
				)}\n`;
				displayString += `Gender: ${p?.gender}\n`;
				displayString += `Level: ${p?.level}\t BST: **${p?.bst}**\n`;
				displayString += `Drain: *${p?.drain}*\n`;
				totalDrain += p?.drain || 0;
			});

			displayString += `### Total Drain: ${totalDrain}`;

			// Send the message
			await interaction.reply({ content: displayString });
		} catch (err) {
			interaction.reply(`Error displaying party for ${OCName} \n\n ${err}`);
		}
	},
};
