import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import OC from '../../../models/OCSchema';
import { isDBConnected } from '../../../mongoose/connection';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-remove-pokemon')
		.setDescription("Removes a Pokemon from your OC's party or box.")
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

			if (!isDBConnected()) {
				return interaction.reply(
					'⚠️ Database is currently unavailable. Please try again later.'
				);
			}

			const targetOC = await OC.findOne({ name: OCName });

			if (!targetOC) return interaction.reply(`${OCName} does not exist.`);

			if (isInBox) {
				const index = targetOC.storage.findIndex(
					(p) => p.nickname === pokeNickname
				);
				if (index === -1)
					return interaction.editReply(
						`${pokeNickname} was not found in storage.`
					);

				// Remove the entry by index
				targetOC.storage.splice(index, 1);
			} else {
				const index = targetOC.party.findIndex(
					(p) => p.nickname === pokeNickname
				);
				if (index === -1)
					return interaction.editReply(
						`${pokeNickname} was not found in party.`
					);

				targetOC.party.splice(index, 1);
			}

			// Save after removing
			await targetOC.save();
			await interaction.editReply(
				`${pokeNickname} has been removed from ${OCName}.`
			);
			await interaction.followUp(
				'https://pbs.twimg.com/media/GXrplDeXMAAvyyA.jpg'
			);
		} catch (err) {
			interaction.reply(
				`Error removing ${pokeNickname} from ${OCName} \n\n ${err}`
			);
		}
	},
};
