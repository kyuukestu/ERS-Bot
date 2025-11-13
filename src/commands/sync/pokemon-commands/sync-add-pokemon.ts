import {
	MessageFlags,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	type SlashCommandStringOption,
} from 'discord.js';
import OC from '../../../database/models/OCSchema.ts';
import Pokemon from '../../../database/models/PokemonSchema.ts';
import { calculateUpkeep } from '../../../utility/calculators/sync-poke-drain-calculator.ts';
import { pokemonEndPoint } from '../../../api/endpoints.ts';
import { extractPokemonInfo } from '~/api/dataExtraction/extractPokemonInfo.ts';
import { formatUserInput } from '../../../utility/formatting/formatUserInput.ts';
import { type PokemonStats } from '../../../interface/canvasData.ts';
import { isDBConnected } from '../../../database/mongoose/connection.ts';

/**
 * Helper: extract stats and calculate derived data
 */
async function buildPokemonData(
	species: string,
	level: number,
	alpha: boolean,
	additionalAbilities: number,
	inBox: boolean,
	formName?: string
) {
	const searchName = formName
		? formatUserInput(`${species} ${formName}`)
		: species;
	const pokemonInfo = extractPokemonInfo(await pokemonEndPoint(searchName));

	const stats: PokemonStats = Object.fromEntries(
		pokemonInfo.stats.map((s: any) => [
			s.stat.name
				.replace('special-attack', 'spAttack')
				.replace('special-defense', 'spDefense'),
			s.base_stat,
		])
	) as PokemonStats;

	const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
	const fortitude_drain = await calculateUpkeep(
		totalStats,
		level,
		alpha,
		additionalAbilities,
		inBox
	);

	return { stats, totalStats, fortitude_drain };
}

/**
 * Helper: create a Pokemon and link it to the OC
 */
async function addPokemonToOC({
	targetOC,
	species,
	level,
	ability,
	gender,
	nickname,
	shiny,
	alpha,
	formName,
	additionalAbilities,
	inBox,
}: {
	targetOC: any;
	species: string;
	level: number;
	ability: string;
	gender?: string | null;
	nickname?: string | null;
	shiny: boolean;
	alpha: boolean;
	formName?: string | null;
	additionalAbilities: number;
	inBox: boolean;
}) {
	const { stats, totalStats, fortitude_drain } = await buildPokemonData(
		species,
		level,
		alpha,
		additionalAbilities,
		inBox,
		formName || undefined
	);

	const pokemon = await Pokemon.create({
		species,
		level,
		ability,
		shiny,
		alpha,
		fortitude_drain,
		gender,
		bst: totalStats,
		stats,
		nickname: nickname || species,
	});

	const destination = inBox ? targetOC.storage : targetOC.party;
	destination.push({ pokemon: pokemon._id });

	await targetOC.save();
	return { pokemon, fortitude_drain };
}

/**
 * Slash Command: /sync-add-pokemon
 */
export default {
	data: new SlashCommandBuilder()
		.setName('sync-add-pokemon')
		.setDescription('Add a Pokémon to your party.')
		.addStringOption((option) =>
			option
				.setName('oc-name')
				.setDescription('Your registered player name')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('species')
				.setDescription('The Pokémon species (e.g. Pikachu)')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('ability')
				.setDescription('Ability of the Pokémon')
				.setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName('level')
				.setDescription('Pokémon level')
				.setMinValue(1)
				.setMaxValue(100)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('nickname').setDescription('Nickname for the Pokémon')
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('form')
				.setDescription(`Enter the Pokémon's form (e.g., alolan, galar).`)
		)
		.addStringOption((option) =>
			option
				.setName('gender')
				.setDescription('Gender of the Pokémon')
				.addChoices(
					{ name: 'Male', value: 'Male' },
					{ name: 'Female', value: 'Female' },
					{ name: 'Genderless', value: 'Genderless' },
					{ name: 'Unknown', value: 'Unknown' }
				)
		)
		.addBooleanOption((option) =>
			option.setName('shiny').setDescription('Shiny status of the Pokémon')
		)
		.addBooleanOption((option) =>
			option.setName('in-box').setDescription('Is the Pokémon in box?')
		)
		.addBooleanOption((option) =>
			option.setName('is-alpha').setDescription('Is the Pokémon an Alpha?')
		)
		.addIntegerOption((option) =>
			option
				.setName('additional-abilities')
				.setDescription('Additional Abilities File')
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const OCName = interaction.options.getString('oc-name', true);
		const species = interaction.options.getString('species', true);
		const level = interaction.options.getInteger('level', true);
		const ability = interaction.options.getString('ability', true);
		const gender = interaction.options.getString('gender');
		const nickname = interaction.options.getString('nickname');
		const shiny = interaction.options.getBoolean('shiny') ?? false;
		const alpha = interaction.options.getBoolean('is-alpha') ?? false;
		const inBox = interaction.options.getBoolean('in-box') ?? false;
		const additionalAbilities =
			interaction.options.getInteger('additional-abilities') ?? 0;
		const formName = interaction.options.getString('form');

		try {
			if (!isDBConnected()) {
				return interaction.reply(
					'⚠️ Database is currently unavailable. Please try again later.'
				);
			}

			const targetOC = await OC.findOne({ name: OCName });
			if (!targetOC) {
				return interaction.reply({
					content: `❌ OC **${OCName}** not found. Please use /sync-register-oc first.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			const { pokemon, fortitude_drain } = await addPokemonToOC({
				targetOC,
				species,
				level,
				ability,
				gender,
				nickname,
				shiny,
				alpha,
				formName,
				additionalAbilities,
				inBox,
			});

			return interaction.reply({
				content: `✅ Added **${pokemon.nickname} (Lv. ${level})** to ${
					targetOC.name
				}'s ${
					inBox ? 'storage' : 'party'
				}!\n\n**Fortitude Drain:** ${fortitude_drain} FP.`,
			});
		} catch (error) {
			console.error(error);
			return interaction.reply({
				content: `❌ An error occurred while adding the Pokémon.\n\`\`\`${error}\`\`\``,
			});
		}
	},
};
