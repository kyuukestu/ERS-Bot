import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
} from 'discord.js';
import OC from '../../../models/OCSchema';
import { type PokemonDocument } from '../../../models/PokemonSchema';
import { isDBConnected } from '../../../mongoose/connection';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-oc-party')
		.setDescription('Displays your OC’s party.')
		.addStringOption((option) =>
			option
				.setName('oc-name')
				.setDescription('Your registered OC’s name')
				.setRequired(true)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const OCName = interaction.options.getString('oc-name', true);

		try {
			if (!isDBConnected()) {
				return interaction.reply({
					content:
						'⚠️ Database is currently unavailable. Please try again later.',
					flags: MessageFlags.Ephemeral,
				});
			}

			const targetOC = await OC.findOne({ name: OCName }).populate<{
				pokemon: PokemonDocument;
			}>('party.pokemon');

			if (!targetOC)
				return interaction.reply({
					content: `❌ OC **${OCName}** does not exist.`,
					flags: MessageFlags.Ephemeral,
				});

			const partyInfo = targetOC.party
				.map((entry) => {
					const pokemonDoc = entry.pokemon as PokemonDocument | null;
					if (!pokemonDoc) return null;

					return {
						nickname: entry.nickname || pokemonDoc.nickname || '—',
						species: entry.species || pokemonDoc.species,
						level: entry.level || pokemonDoc.level,
						drain: entry.drain || pokemonDoc.fortitude_drain,
						gender: pokemonDoc.gender,
						ability: pokemonDoc.ability,
						bst: pokemonDoc.bst,
					};
				})
				.filter(Boolean) as {
				nickname: string;
				species: string;
				level: number;
				drain: number;
				gender: string;
				ability: string[];
				bst: number;
			}[];

			if (partyInfo.length === 0)
				return interaction.reply({
					content: `🧳 OC **${OCName}** has no Pokémon in their party.`,
					flags: MessageFlags.Ephemeral,
				});

			let totalDrain = 0;

			const embed = new EmbedBuilder()
				.setTitle(`🎯 ${OCName}'s Party`)
				.setColor(0x6a5acd)
				.setTimestamp();

			partyInfo.forEach((p, idx) => {
				totalDrain += p.drain;

				embed.addFields({
					name: `${idx + 1}. ${p.nickname} (${p.species.toUpperCase()})`,
					value: `**Level:** ${p.level}\n**BST:** ${p.bst}\n**Gender:** ${
						p.gender
					}\n**Drain:** ${p.drain}\n**Abilities:** ${p.ability.join(', ')}`,
				});
			});

			embed.setFooter({ text: `Total Drain: ${totalDrain}` });

			await interaction.reply({ embeds: [embed] });
		} catch (err) {
			console.error(err);
			await interaction.reply({
				content: `❌ Error displaying party for ${OCName}.\n\n${err}`,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
