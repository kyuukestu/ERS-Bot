import {
	EmbedBuilder,
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandBooleanOption,
	SlashCommandNumberOption,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { formatUserInput } from '../../components/utility/formatUserInput';
import { type PokemonData } from '../../components/interface/apiData';
import { type PokemonStats } from '../../components/interface/canvasData.ts';
import { pokemonEndPoint } from '../../components/api/pokeapi';
import { extractPokemonInfo } from '../../components/utility/dataExtraction';
import { calculateUpkeep } from '../../components/utility/pokeUpkeepCalc.ts';

export default {
	data: new SlashCommandBuilder()
		.setName('pokemon-upkeep')
		.setDescription('Calculates the Fortitude Upkeep of a pokemon.')
		.addStringOption((option: SlashCommandStringOption) =>
			option
				.setName('pokemon')
				.setDescription('Enter the pokemon name.')
				.setRequired(true)
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
		const formName = interaction.options.get('form', false)
			? formatUserInput(interaction.options.get('form')?.value as string)
			: '';
		const searchName = formatUserInput(`${pokemonName} ${formName}`);

		try {
			await interaction.deferReply();

			const data: PokemonData = await pokemonEndPoint(searchName);
			const pokemonInfo = extractPokemonInfo(data);

			interface StatObject {
				base_stat: number;
				stat: {
					name: string;
				};
			}

			const stats: PokemonStats = {
				hp:
					data.stats.find((s: StatObject) => s.stat.name === 'hp')?.base_stat ||
					0,
				attack:
					data.stats.find((s: StatObject) => s.stat.name === 'attack')
						?.base_stat || 0,
				defense:
					data.stats.find((s: StatObject) => s.stat.name === 'defense')
						?.base_stat || 0,
				specialAttack:
					data.stats.find((s: StatObject) => s.stat.name === 'special-attack')
						?.base_stat || 0,
				specialDefense:
					data.stats.find((s: StatObject) => s.stat.name === 'special-defense')
						?.base_stat || 0,
				speed:
					data.stats.find((s: StatObject) => s.stat.name === 'speed')
						?.base_stat || 0,
			};

			const totalStats = Object.values(stats).reduce(
				(sum, stat) => sum + stat,
				0
			);

			const upkeep = calculateUpkeep(
				totalStats,
				isAlpha || undefined,
				extraAbilities || undefined,
				inBox || undefined
			);

			const sprites = {
				default: isShiny
					? data.sprites.front_shiny
					: data.sprites.front_default,
				shiny: data.sprites.front_shiny,
				back: isShiny ? data.sprites.back_shiny : data.sprites.back_default,
				backShiny: data.sprites.back_shiny,
				officialArtwork: data.sprites.other['official-artwork']?.front_default,
				shinyArtwork: data.sprites.other['official-artwork']?.front_shiny,
				dreamWorld: data.sprites.other.dream_world?.front_default,
			};

			const embed = new EmbedBuilder()
				.setColor(0xff9999)
				.setTitle(`${pokemonInfo.name} Upkeep`)
				.setThumbnail(sprites.default)
				.addFields([
					{ name: 'Upkeep', value: `${upkeep}`, inline: true },
					{ name: 'Base Stat Total', value: `${totalStats}`, inline: true },
				])
				.setImage(isShiny ? sprites.shinyArtwork : sprites.officialArtwork)
				.setTimestamp();

			await interaction.editReply({ embeds: [embed] });
		} catch (err) {
			console.error(err);
		}
	},
};
