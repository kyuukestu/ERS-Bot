import {
	MessageFlags,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
	type SlashCommandStringOption,
} from 'discord.js';
import Pokemon from '../../../database/models/PokemonSchema.ts';
import { calculateUpkeep } from '../../../utility/calculators/sync-poke-drain-calculator.ts';
import { pokemonEndPoint } from '../../../api/endpoints.ts';
import { extractPokemonInfo } from '~/api/dataExtraction/extractPokemonInfo.ts';
import { formatUserInput } from '../../../utility/formatting/formatUserInput.ts';
import { type PokemonStats } from '../../../interface/canvasData.ts';
import { isDBConnected } from '../../../database/mongoose/connection.ts';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-update-pokemon')
		.setDescription('Update a Pokémon in your party.')
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('poke-id')
				.setDescription('Unique ID for the Pokémon.')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('nickname').setDescription('Nickname of the Pokémon')
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
		const pokeId = interaction.options.getString('poke-id', true);
		const nicknameOpt =
			interaction.options.getString('nickname', false) ?? null;
		const speciesOpt = interaction.options.getString('species', false) ?? null;
		const formName = interaction.options.getString('form', false) ?? null;
		const levelOpt = interaction.options.getInteger('level', false); // optional
		const genderOpt = interaction.options.getString('gender', false) ?? null;
		// option name is 'ability-list'
		const abilityListOpt =
			interaction.options.getString('ability-list', false) ?? null;
		const shinyOpt = interaction.options.getBoolean('shiny', false); // boolean | null
		const inBoxOpt = interaction.options.getBoolean('in-box', false); // boolean | null
		const alphaOpt = interaction.options.getBoolean('is-alpha', false); // boolean | null

		try {
			// Check DB connection first (no defer yet)
			if (!isDBConnected()) {
				return interaction.reply({
					content:
						'⚠️ Database is currently unavailable. Please try again later.',
					flags: MessageFlags.Ephemeral,
				});
			}

			await interaction.deferReply();

			// Fetch the actual Pokémon document
			const pokemon = await Pokemon.findById(pokeId);
			if (!pokemon) {
				return interaction.followUp({
					content: `❌ Pokémon data for **${pokeId}** could not be found. Use /sync-show-party to see your party.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			// Track whether we actually changed any fields that require recalculation
			let didUpdateRelevantFields = false;

			// Update only fields provided
			if (nicknameOpt !== null) {
				pokemon.nickname = nicknameOpt;
			}

			// Level: only update if provided
			if (levelOpt !== null && levelOpt !== undefined) {
				// ensure valid range just in case
				const levelVal = Math.max(1, Math.min(100, levelOpt));
				if (pokemon.level !== levelVal) {
					pokemon.level = levelVal;
					didUpdateRelevantFields = true;
				}
			}

			// Species: if provided, use it; otherwise keep DB species
			let finalSpecies = pokemon.species;
			if (speciesOpt) {
				finalSpecies = speciesOpt;
				if (pokemon.species !== speciesOpt) {
					pokemon.species = speciesOpt;
					didUpdateRelevantFields = true;
				}
			}

			// Gender
			if (genderOpt !== null) {
				if (pokemon.gender !== genderOpt) {
					pokemon.gender = genderOpt as
						| 'Male'
						| 'Female'
						| 'Genderless'
						| 'Unknown';
				}
			}

			// Abilities list: overwrite if provided
			if (abilityListOpt !== null) {
				const abilities = abilityListOpt
					.split(',')
					.map((a) => a.trim())
					.filter(Boolean);
				pokemon.ability = abilities;
				didUpdateRelevantFields = true;
			}

			// Shiny / alpha / inBox: only set when provided (not overwrite with false by default)
			if (shinyOpt !== null && shinyOpt !== undefined) {
				if (pokemon.shiny !== shinyOpt) {
					pokemon.shiny = shinyOpt;
				}
			}
			if (alphaOpt !== null && alphaOpt !== undefined) {
				if (pokemon.alpha !== alphaOpt) {
					pokemon.alpha = alphaOpt;
					didUpdateRelevantFields = true; // alpha affects upkeep
				}
			}
			if (inBoxOpt !== null && inBoxOpt !== undefined) {
				if (pokemon.inBox !== inBoxOpt) {
					pokemon.inBox = inBoxOpt;
				}
			}

			// If species was not provided but a form is provided, we should keep finalSpecies as current DB species.
			// Prepare searchName for pokeapi lookup only if recalculation needed.
			if (didUpdateRelevantFields) {
				// Build search name using provided species (or DB species) + form if present
				const searchName = formName
					? formatUserInput(`${finalSpecies} ${formName}`)
					: formatUserInput(String(finalSpecies));

				// Fetch API data and extract stats
				const pokemonApiRaw = await pokemonEndPoint(searchName).catch(
					async (err) => {
						// fallback to species only if form lookup fails
						if (formName) {
							return pokemonEndPoint(formatUserInput(finalSpecies));
						}
						throw err;
					}
				);

				const pokemonInfo = extractPokemonInfo(await pokemonApiRaw);

				// Build stats object
				type StatObj = { base_stat: number; stat: { name: string } };
				const stats: PokemonStats = {
					hp:
						pokemonInfo.stats.find((s: StatObj) => s.stat.name === 'hp')
							?.base_stat ?? 0,
					attack:
						pokemonInfo.stats.find((s: StatObj) => s.stat.name === 'attack')
							?.base_stat ?? 0,
					defense:
						pokemonInfo.stats.find((s: StatObj) => s.stat.name === 'defense')
							?.base_stat ?? 0,
					spAttack:
						pokemonInfo.stats.find(
							(s: StatObj) => s.stat.name === 'special-attack'
						)?.base_stat ?? 0,
					spDefense:
						pokemonInfo.stats.find(
							(s: StatObj) => s.stat.name === 'special-defense'
						)?.base_stat ?? 0,
					speed:
						pokemonInfo.stats.find((s: StatObj) => s.stat.name === 'speed')
							?.base_stat ?? 0,
				};

				const totalStats = Object.values(stats).reduce(
					(sum, s) => sum + (s as number),
					0
				);

				// Use the updated pokemon.level (if provided) or DB value
				const levelForCalc = pokemon.level ?? 1;
				const alphaForCalc = pokemon.alpha ?? false;
				const inBoxForCalc = pokemon.inBox ?? false;
				const additionalAbilities = Math.max(
					0,
					(abilityListOpt?.length ?? 1) - 1
				);

				const fortitude_drain = await calculateUpkeep(
					totalStats,
					levelForCalc,
					Boolean(alphaForCalc),
					additionalAbilities,
					Boolean(inBoxForCalc)
				);

				// store updated drain
				pokemon.fortitude_drain = fortitude_drain;
			}

			// Save the Pokémon document (only once)
			await pokemon.save();

			// Success reply
			return interaction.editReply({
				content: `✅ Updated Pokémon **${pokeId}** successfully.`,
			});
		} catch (error) {
			console.error('sync-update-pokemon error:', error);
			// If we already deferred, use editReply; otherwise reply.
			try {
				if (interaction.deferred || interaction.replied) {
					return interaction.editReply({
						content: `❌ An error occurred while updating the Pokémon.\nError: ${String(
							error
						)}`,
					});
				} else {
					return interaction.reply({
						content: `❌ An error occurred while updating the Pokémon.\nError: ${String(
							error
						)}`,
						flags: MessageFlags.Ephemeral,
					});
				}
			} catch (replyErr) {
				console.error('Error sending failure reply:', replyErr);
			}
		}
	},
};
