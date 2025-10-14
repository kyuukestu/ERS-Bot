import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import {
	modifyInventory,
	type action,
} from '../../../utility/database/modify-inventory';
import { isDBConnected } from '../../../mongoose/connection';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-modify-inv')
		.setDescription('Modifies the inventory of an Oc.')
		.addStringOption((option) =>
			option
				.setName('oc-name')
				.setDescription('Your registered ocs name')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('action')
				.setDescription('Action to be performed on inventory')
				.addChoices(
					{ name: 'Add', value: 'ADD' },
					{ name: 'Remove', value: 'REMOVE' },
					{ name: 'Delete', value: 'DELETE' },
					{ name: 'Buy', value: 'BUY' },
					{ name: 'Sell', value: 'SELL' },
					{ name: 'Trade', value: 'TRADE' }
				)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('target-oc')
				.setDescription('Target OC for the transaction.')
		)
		.addStringOption((option) =>
			option.setName('item-name').setDescription('Item name')
		)
		.addIntegerOption((option) =>
			option.setName('quantity').setDescription('Item amount')
		)

		.addStringOption((option) =>
			option.setName('reason').setDescription('Reason for the action')
		)
		.addNumberOption((option) =>
			option
				.setName('value')
				.setDescription(
					'Enter a custom value; only use this for custom transactions/Trades.'
				)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const OCName = interaction.options.getString('oc-name', true);
		const targetOC = interaction.options.getString('target-oc');
		const action = interaction.options.getString('action', true) as action;
		const itemName = interaction.options.getString('item-name');
		const quantity = interaction.options.getInteger('quantity');
		const reason = interaction.options.getString('reason');
		const value = interaction.options.getNumber('value');

		try {
			await interaction.deferReply();

			if (!isDBConnected) {
				return interaction.reply(
					'⚠️ Database is currently unavailable. Please try again later.'
				);
			}

			await modifyInventory({
				OCName,
				targetOC: targetOC,
				itemName,
				quantityChange: quantity ?? 0,
				action,
				reason,
				value: value ?? 0,
			});

			return interaction.editReply(`✅ ${action} successful.`);
		} catch (error) {
			console.error(error);

			return interaction.editReply(`❌ ${action} failed. \n\nError: ${error}}`);
		}
	},
};
