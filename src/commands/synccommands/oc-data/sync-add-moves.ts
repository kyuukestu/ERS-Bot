import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import OC from '../../../models/OCSchema';
import Pokemon from '../../../models/PokemonSchema';
import { Types } from 'mongoose';
import { isDBConnected } from '../../../mongoose/connection';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-add-moves')
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
		.addStringOption((option) =>
			option
				.setName('moves')
				.setDescription('List of moves separated by a comma.')
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
		const moveList = interaction.options
			.getString('moves', true)
			.split(',')
			.map((move: string) => move.trim());
		const isInBox = interaction.options.getBoolean('in-box') || false;

		try {
			await interaction.deferReply();

			if (!isDBConnected()) {
				return interaction.reply(
					'⚠️ Database is currently unavailable. Please try again later.'
				);
			}

			const targetOC = await OC.findOne({ name: OCName });

			if (!targetOC) return interaction.reply(`${OCName} does not exist.`);

			if (isInBox) {
				const targetPokemon = targetOC.storage.find(
					(p) => p.nickname === pokeNickname
				);

				if (!targetPokemon || !targetPokemon.pokemon)
					return interaction.reply(`${pokeNickname} was not found in storage.`);

				const pokemonId: Types.ObjectId =
					targetPokemon.pokemon as Types.ObjectId;

				await Pokemon.findByIdAndUpdate(
					pokemonId,
					{ $addToSet: { moves: { $each: moveList } } },
					{ new: true }
				);

				interaction.editReply(
					`${pokeNickname}'s moves have been updated!
					**Added:\n** ${moveList.join('\n ')}`
				);
			} else {
				const targetPokemon = targetOC.party.find(
					(p) => p.nickname === pokeNickname
				);

				if (!targetPokemon || !targetPokemon.pokemon)
					return interaction.reply(`${pokeNickname} was not found in party.`);

				const pokemonId: Types.ObjectId =
					targetPokemon.pokemon as Types.ObjectId;

				await Pokemon.findByIdAndUpdate(
					pokemonId,
					{ $addToSet: { moves: { $each: moveList } } },
					{ new: true }
				);

				interaction.editReply(
					`${pokeNickname}'s moves have been updated!
					\n**Added:**\n- ${moveList.join('\n- ')}`
				);
			}
		} catch (err) {
			interaction.reply(`Error adding moves for ${OCName} \n\n ${err}`);
		}
	},
};
