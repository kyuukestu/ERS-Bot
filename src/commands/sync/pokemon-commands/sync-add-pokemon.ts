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
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('form')
				.setDescription(`Enter the pokémon's form (e.g., alolan, galar).`)
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
			option.setName('nickname').setDescription('Nickname for the Pokémon')
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
		const gender = interaction.options.getString('gender');
		const ability = interaction.options.getString('ability', true);
		const nickname = interaction.options.getString('nickname'); // Get the nickname option value
		const shiny = interaction.options.getBoolean('shiny') || false; // Get the shiny option value or set it as false if not provided
		const alpha = interaction.options.getBoolean('is-alpha') || false; // Get the is-alpha option value or set it as false if not provided
		const inBox = interaction.options.getBoolean('in-box') || false; // Get the in-box option value or set it as false if not provided
		const additionalAbilities =
			interaction.options.getNumber('additional-abilities') || 0;
		const formName = interaction.options.getString('form');
		const searchName = formName
			? formatUserInput(`${species} ${formName}`)
			: species;
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

			const pokemonInfo = extractPokemonInfo(await pokemonEndPoint(searchName));

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
				level,
				alpha,
				additionalAbilities,
				inBox
			);

			const pokemon = await Pokemon.create({
				species: species,
				level: level,
				ability: ability,
				shiny: shiny,
				alpha: alpha,
				fortitude_drain: fortitude_drain,
				gender: gender,
				bst: totalStats,
				stats: stats,
				nickname: nickname ? nickname : species, // Use the nickname if provided, otherwise use the species name
			});

			if (inBox) {
				targetOC.storage.push({
					pokemon: pokemon._id,
					nickname: nickname ? nickname : species,
					species: species,
					level: level,
					drain: fortitude_drain,
				});
			} else {
				targetOC.party.push({
					pokemon: pokemon._id,
					nickname: nickname ? nickname : species,
					species: species,
					level: level,
					drain: fortitude_drain,
				});
			}

			await targetOC.save();

			return interaction.reply({
				content: `✅ Added **${species} (Lv. ${level})** to ${
					targetOC.name
				}'s ${
					inBox ? 'storage' : 'party'
				}!\n\n**Fortitude Drain:** ${fortitude_drain} FP.`,
			});
		} catch (error) {
			console.error(error);
			return interaction.reply({
				content: `❌ An error occurred while adding the Pokémon.\nError: ${error}`,
			});
		}
	},
};
