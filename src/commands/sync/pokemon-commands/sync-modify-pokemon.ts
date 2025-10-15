import {
	MessageFlags,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	type SlashCommandStringOption,
} from 'discord.js';
import OC from '../../../models/OCSchema.ts';
import Pokemon from '../../../models/PokemonSchema.ts';
import { calculateUpkeep } from '../../../utility/calculators/sync-poke-drain-calculator.ts';
import { pokemonEndPoint } from '../../../utility/api/pokeapi.ts';
import { extractPokemonInfo } from '../../../utility/dataExtraction/extractPokemonInfo.ts';
import { formatUserInput } from '../../../utility/formatting/formatUserInput.ts';
import { type PokemonStats } from '../../../interface/canvasData.ts';
import { isDBConnected } from '../../../mongoose/connection.ts';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-update-pokemon')
		.setDescription('Update a Pokémon in your party.')
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('oc-name')
				.setDescription('Your registered player name')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('nickname')
				.setDescription('Nickname for the Pokémon')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('species').setDescription('Species of the Pokémon')
		)
		.addStringOption((option) =>
			option.setName('form').setDescription('Form of the Pokémon')
		)
		.addIntegerOption((option) =>
			option
				.setName('level')
				.setDescription('Pokémon level')
				.setMinValue(1)
				.setMaxValue(100)
				.setRequired(false)
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
		.addStringOption((option) =>
			option
				.setName('ability-list')
				.setDescription(
					"Pokemon's abilities; separate by commas. Note: overwrite any existing abilities"
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
				.setDescription('Total number of additional abilities')
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const OCName = interaction.options.getString('oc-name', true);
		let species = interaction.options.getString('species');
		const level = interaction.options.getInteger('level', true);
		const gender = interaction.options.getString('gender');
		const ability = interaction.options
			.getString('ability')
			?.split(',')
			.map((a) => a.trim());
		const nickname = interaction.options.getString('nickname'); // Get the nickname option value
		const shiny = interaction.options.getBoolean('shiny') || false; // Get the shiny option value or set it as false if not provided
		const alpha = interaction.options.getBoolean('is-alpha') || false; // Get the is-alpha option value or set it as false if not provided
		const inBox = interaction.options.getBoolean('in-box') || false; // Get the in-box option value or set it as false if not provided
		const additionalAbilities =
			interaction.options.getNumber('additional-abilities') || 0;
		const formName = interaction.options.getString('form');

		const targetOC = await OC.findOne({ name: OCName });

		try {
			if (!isDBConnected()) {
				return interaction.reply(
					'⚠️ Database is currently unavailable. Please try again later.'
				);
			}
			if (!targetOC) {
				return interaction.reply({
					content: `❌ OC **${OCName}** not found. Please use /sync-register-oc first.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			const collection = inBox ? targetOC.storage : targetOC.party;

			const targetEntry = collection.find((p) => p.nickname === nickname);

			if (!targetEntry) {
				return interaction.reply({
					content: `❌ Pokémon with nickname **${nickname}** not found in ${
						inBox ? 'storage' : 'party'
					}.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			// Fetch the actual Pokémon document
			const pokemon = await Pokemon.findById(targetEntry.pokemon);
			if (!pokemon) {
				return interaction.reply({
					content: `❌ Pokémon data for **${nickname}** could not be found.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			// Only update fields that were provided
			if (level) pokemon.level = level;
			if (species) {
				pokemon.species = species;
			} else {
				species = pokemon.species;
			}
			if (gender)
				pokemon.gender = gender as 'Male' | 'Female' | 'Genderless' | 'Unknown';
			if (ability) pokemon.ability = ability;
			if (typeof shiny === 'boolean') pokemon.shiny = shiny;
			if (typeof alpha === 'boolean') pokemon.alpha = alpha;

			// Recalculate stats/drain only if level, alpha, or additional abilities changed
			if (level || alpha || additionalAbilities || species) {
				const searchName = formName
					? formatUserInput(`${species} ${formName}`)
					: species;

				const pokemonInfo = extractPokemonInfo(
					await pokemonEndPoint(searchName)
				);

				interface StatObject {
					base_stat: number;
					stat: {
						name: string;
					};
				}

				const stats: PokemonStats = {
					hp:
						pokemonInfo.stats.find((s: StatObject) => s.stat.name === 'hp')
							?.base_stat || 0,
					attack:
						pokemonInfo.stats.find((s: StatObject) => s.stat.name === 'attack')
							?.base_stat || 0,
					defense:
						pokemonInfo.stats.find((s: StatObject) => s.stat.name === 'defense')
							?.base_stat || 0,
					spAttack:
						pokemonInfo.stats.find(
							(s: StatObject) => s.stat.name === 'special-attack'
						)?.base_stat || 0,
					spDefense:
						pokemonInfo.stats.find(
							(s: StatObject) => s.stat.name === 'special-defense'
						)?.base_stat || 0,
					speed:
						pokemonInfo.stats.find((s: StatObject) => s.stat.name === 'speed')
							?.base_stat || 0,
				};

				const totalStats = Object.values(stats).reduce(
					(sum, stat) => sum + stat,
					0
				);

				const fortitude_drain = await calculateUpkeep(
					totalStats,
					pokemon.level,
					alpha,
					additionalAbilities,
					inBox
				);
				pokemon.fortitude_drain = fortitude_drain;
				targetEntry.drain = fortitude_drain;
			}

			// Save the Pokémon document
			await pokemon.save();
			await targetOC.save();

			return interaction.reply({
				content: `✅ Updated **${nickname}** in ${targetOC.name}'s ${
					inBox ? 'storage' : 'party'
				}.`,
			});
		} catch (error) {
			console.error(error);
			return interaction.reply({
				content: `❌ An error occurred while adding the Pokémon.\nError: ${error}`,
			});
		}
	},
};
