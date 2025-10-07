import {
	EmbedBuilder,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandBooleanOption,
	SlashCommandNumberOption,
	type ChatInputCommandInteraction,
	type SlashCommandIntegerOption,
} from 'discord.js';
import { formatUserInput } from '../../utility/formatting/formatUserInput.ts';
import { type PokemonStats } from '../../interface/canvasData.ts';
import { pokemonEndPoint } from '../../utility/api/pokeapi.ts';
import { extractPokemonInfo } from '../../utility/dataExtraction/extractPokemonInfo.ts';
import { calculateUpkeep } from '../../utility/calculators/sync-poke-drain-calculator.ts';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-poke-drain')
		.setDescription(
			'Calculates the passive Fortitude drain (or Up Keep) of a pokemon.'
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('pokemon')
				.setDescription('Enter the pokemon name.')
				.setRequired(true)
		)
		.addIntegerOption((option: SlashCommandIntegerOption) =>
			option
				.setName('level')
				.setDescription("Enter the Pokemon's level (Defaults to 1).")
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(100)
		)
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('form')
				.setDescription(`Enter the pokémon's form (e.g., alolan, galar).`)
				.setRequired(false)
		)
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('alpha')
				.setDescription('Is this an alpha pokemon?')
				.setRequired(false)
		)
		.addNumberOption((option: SlashCommandNumberOption) =>
			option
				.setName('extra-abilities')
				.setDescription('Enter the pokeball name.')
				.setRequired(false)
		)
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('box')
				.setDescription('Is this pokemon in the PC box?')
				.setRequired(false)
		)
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option
				.setName('shiny')
				.setDescription('Show shiny variant.')
				.setRequired(false)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const pokemonName = formatUserInput(
			interaction.options.getString('pokemon', true)
		);
		const isAlpha = interaction.options.getBoolean('alpha');
		const extraAbilities = interaction.options.getNumber('extra-abilities');
		const inBox = interaction.options.getBoolean('box');
		const isShiny =
			(interaction.options.get('shiny', false)?.value as boolean) || false;
		const formName = interaction.options.getString('form');
		const searchName = formName
			? formatUserInput(`${pokemonName} ${formName}`)
			: pokemonName;
		const level = interaction.options.getInteger('level', true);

		try {
			await interaction.deferReply();

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
				specialAttack:
					pokemonInfo.stats.find(
						(s: StatObject) => s.stat.name === 'special-attack'
					)?.base_stat || 0,
				specialDefense:
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

			const upkeep = calculateUpkeep(
				totalStats,
				level,
				isAlpha || undefined,
				extraAbilities || undefined,
				inBox || undefined
			);

			const sprites = {
				default: isShiny
					? pokemonInfo.sprites.front_shiny
					: pokemonInfo.sprites.front_default,
				shiny: pokemonInfo.sprites.front_shiny,
				back: isShiny
					? pokemonInfo.sprites.back_shiny
					: pokemonInfo.sprites.back_default,
				backShiny: pokemonInfo.sprites.back_shiny,
				officialArtwork:
					pokemonInfo.sprites.other['official-artwork']?.front_default,
				shinyArtwork:
					pokemonInfo.sprites.other['official-artwork']?.front_shiny,
				dreamWorld: pokemonInfo.sprites.other.dream_world?.front_default,
			};

			const embed = new EmbedBuilder()
				.setColor(0xff9999)
				.setTitle(`${pokemonInfo.name} - Level ${level}`)
				.setThumbnail(sprites.default)
				.addFields([
					{ name: 'Fortitude Drain:', value: `${upkeep}`, inline: true },
					{ name: 'Base Stat Total:', value: `${totalStats}`, inline: true },
					{
						name: 'Extra Abilities:',
						value: `${extraAbilities}`,
						inline: false,
					},
					{ name: 'Alpha:', value: `${isAlpha ? 'Yes' : 'No'}`, inline: true },
					{
						name: 'In Box:',
						value: `${inBox ? 'Yes' : 'No'}`,
						inline: false,
					},
				])
				.setImage(
					isShiny
						? sprites.shinyArtwork ?? sprites.default
						: sprites.officialArtwork ?? sprites.default
				)
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			console.error(err);

			const errorEmbed = new EmbedBuilder()
				.setColor('#ff0000')
				.setTitle('❌ Error')
				.setDescription(
					`An error occurred while fetching data for \`${searchName}\`.\nError: ${err}`
				);

			await interaction.editReply({ embeds: [errorEmbed] });
		}
	},
};
