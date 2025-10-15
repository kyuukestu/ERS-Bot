import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { modifyInventory, type action } from '~/database/modify-inventory';
import { isDBConnected } from '../../../database/mongoose/connection';

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
		.addBooleanOption((option) =>
			option.setName('custom-item').setDescription('Used for a custom item.')
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
		const customItem = interaction.options.getBoolean('custom-item') ?? false;

		try {
			if (!isDBConnected) {
				return interaction.reply(
					'⚠️ Database is currently unavailable. Please try again later.'
				);
			}

			const action_data = await modifyInventory({
				OCName,
				targetOC: targetOC,
				itemName,
				quantityChange: quantity ?? 0,
				action,
				reason,
				value: value ?? 0,
				customItem,
			});

			return interaction.reply(`✅ ${action} successful.\n\n 
				Initiator:${action_data?.oc}\n
				Target:${action_data?.targetOC}\n
				Action:  ${action_data?.action}\n
				Reason: ${action_data?.reason}\n
				Item: ${action_data?.item}\n
				Quantity: ${action_data?.quantity}\n
				Money Traded: ${action_data?.value}`);
		} catch (error) {
			console.error(error);

			return interaction.reply(`❌ ${action} failed. \n\nError: ${error}}`);
		}
	},
};
