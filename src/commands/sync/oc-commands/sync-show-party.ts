import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
} from 'discord.js';
import { id } from 'zod/locales';
import OC from '~/database/models/OCSchema.ts';
import { type PokemonDocument } from '~/database/models/PokemonSchema.ts';
import { isDBConnected } from '~/database/mongoose/connection.ts';

/** 🧠 Helper: Fetch OC and populate their party */
async function fetchOCParty(OCName: string) {
	const oc = await OC.findOne({ name: OCName }).populate<{
		party: { pokemon: PokemonDocument }[];
	}>('party.pokemon');
	return oc;
}

/** 📦 Helper: Build a clean, uniform structure from the populated Pokémon docs */
function formatPartyData(oc: any) {
	return oc.party
		.map((entry: any) => {
			const pokemonDoc = entry.pokemon as PokemonDocument | null;
			if (!pokemonDoc) return null;

			return {
				id: pokemonDoc._id,
				nickname: pokemonDoc.nickname || pokemonDoc.species,
				species: pokemonDoc.species,
				level: pokemonDoc.level,
				drain: pokemonDoc.fortitude_drain ?? 0,
				gender: pokemonDoc.gender ?? 'Unknown',
				ability: Array.isArray(pokemonDoc.ability)
					? pokemonDoc.ability
					: [pokemonDoc.ability],
				bst: pokemonDoc.bst ?? 0,
			};
		})
		.filter(Boolean) as {
		id: string;
		nickname: string;
		species: string;
		level: number;
		drain: number;
		gender: string;
		ability: string[];
		bst: number;
	}[];
}

/** 🎨 Helper: Create a nice embed from the data */
function buildPartyEmbed(
	OCName: string,
	partyData: ReturnType<typeof formatPartyData>
) {
	const embed = new EmbedBuilder()
		.setTitle(`🎯 ${OCName}'s Party`)
		.setColor(0x6a5acd)
		.setTimestamp();

	let totalDrain = 0;

	partyData.forEach((p, i) => {
		totalDrain += p.drain;
		embed.addFields({
			name: `${i + 1}. ${p.nickname} (${p.species.toUpperCase()})
			\n**ID:** *${p.id}*`,
			value: [
				`**Level:** ${p.level}`,
				`**BST:** ${p.bst}`,
				`**Gender:** ${p.gender}`,
				`**Drain:** ${p.drain}`,
				`**Ability:** ${p.ability.join(', ')}`,
			].join('\n'),
		});
	});

	embed.setFooter({ text: `Total Fortitude Drain: ${totalDrain} FP` });
	return embed;
}

/** 🧩 Command Definition */
export default {
	data: new SlashCommandBuilder()
		.setName('sync-show-party')
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

			const targetOC = await fetchOCParty(OCName);
			if (!targetOC) {
				return interaction.reply({
					content: `❌ OC **${OCName}** does not exist.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			const partyData = formatPartyData(targetOC);
			if (partyData.length === 0) {
				return interaction.reply({
					content: `🧳 OC **${OCName}** has no Pokémon in their party.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			const embed = buildPartyEmbed(OCName, partyData);
			await interaction.reply({ embeds: [embed] });
		} catch (err) {
			console.error(err);
			await interaction.reply({
				content: `❌ Error displaying party for ${OCName}.\n\`\`\`${err}\`\`\``,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
