import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import OC from '../../../models/OCSchema';
import Pokemon from '../../../models/PokemonSchema';
import { Types } from 'mongoose';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-show-moves')
		.setDescription(
			'Add moves to your Pokemon. List of moves must be separated by a comma.'
		)
		.addStringOption((option) =>
			option
				.setName('oc-name')
				.setDescription('Your registered ocs name')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('poke-nickname')
				.setDescription("Target Pokemon's nickname.")
				.setRequired(true)
		)
		.addBooleanOption((option) =>
			option
				.setName('in-box')
				.setDescription('Is this Pokemon in the box? (Defaults to false).')
				.setRequired(false)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const OCName = interaction.options.getString('oc-name');
		const pokeNickname = interaction.options.getString('poke-nickname');
		const isInBox = interaction.options.getBoolean('in-box') || false;

		try {
			await interaction.deferReply();

			const targetOC = await OC.findOne({ name: OCName });

			if (!targetOC) return interaction.editReply(`${OCName} does not exist.`);

			if (isInBox) {
				const targetPokemon = targetOC.storage.find(
					(p) => p.nickname === pokeNickname
				);

				if (!targetPokemon || !targetPokemon.pokemon)
					return interaction.editReply(
						`${pokeNickname} was not found in storage.`
					);

				const pokemonId: Types.ObjectId =
					targetPokemon.pokemon as Types.ObjectId;

				const pokemon = await Pokemon.findById(pokemonId);

				let moveList = '';
				pokemon?.moves.map((move, idx) => {
					moveList += `${idx + 1}. ${move}\n`;
				});

				interaction.editReply(moveList);
			} else {
				const targetPokemon = targetOC.party.find(
					(p) => p.nickname === pokeNickname
				);

				if (!targetPokemon || !targetPokemon.pokemon)
					return interaction.editReply(
						`${pokeNickname} was not found in storage.`
					);

				const pokemonId: Types.ObjectId =
					targetPokemon.pokemon as Types.ObjectId;

				const pokemon = await Pokemon.findById(pokemonId);

				let moveList = '';
				pokemon?.moves.map((move, idx) => {
					moveList += `${idx + 1}. ${move}\n`;
				});

				interaction.editReply(moveList);
			}
		} catch (err) {
			interaction.editReply(
				`Error displaying moves for ${pokeNickname} on ${OCName} \n\n ${err}`
			);
		}
	},
};
