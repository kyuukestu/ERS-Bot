import {
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import {
	processTransaction,
	type action,
} from '~/database/processTransactions';
import { isDBConnected } from '~/database/mongoose/connection';

export default {
	data: new SlashCommandBuilder()
		.setName('sync-transaction')
		.setDescription(
			'Performs a monetary transaction and modifies inventory appropriately.'
		)
		.addStringOption((option) =>
			option
				.setName('oc-name')
				.setDescription('Your registered ocs name')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('action')
				.setDescription('Action to be performed.')
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
				.setName('rp-date')
				.setDescription('RP date of the transaction. (YYYY-MM-DD)')
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
		.addStringOption((option) =>
			option
				.setName('service-name')
				.setDescription('Service name e.g. Transportation (Bus, Train, Plane).')
		)
		.addBooleanOption((option) =>
			option.setName('custom-item').setDescription('Used for a custom item.')
		)
		.addBooleanOption((option) =>
			option
				.setName('is-league-service')
				.setDescription('Used for a League-provided services e.g. PokeCenter')
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
		)
		.addBooleanOption((option) =>
			option
				.setName('is-service')
				.setDescription('Is this a service? (Default False.')
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const OCName = interaction.options.getString('oc-name', true);
		const targetOC = interaction.options.getString('target-oc');
		const action = interaction.options.getString('action', true) as action;
		const itemName = interaction.options.getString('item-name');
		const serviceName = interaction.options.getString('service-name');
		const quantity = interaction.options.getInteger('quantity');
		const reason = interaction.options.getString('reason');
		const value = interaction.options.getNumber('value');
		const customItem = interaction.options.getBoolean('custom-item') ?? false;
		const isLeagueService =
			interaction.options.getBoolean('league-service') ?? false;
		const isService = interaction.options.getBoolean('is-service') ?? false;
		const rpDate = interaction.options.getString('rp-date', true);

		try {
			if (!isDBConnected) {
				return interaction.reply(
					'⚠️ Database is currently unavailable. Please try again later.'
				);
			}

			const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
			if (!dateFormatRegex.test(rpDate)) {
				throw new Error(
					`Invalid date format: "${rpDate}". Please use the format YYYY-MM-DD.`
				);
			}

			const action_data = await processTransaction({
				OCName,
				targetOC: targetOC,
				itemName,
				serviceName,
				quantityChange: quantity ?? 0,
				action,
				reason,
				value: value,
				customItem,
				isLeagueService,
				isService,
				rpDate,
			});

			return interaction.reply(`✅ ${action} successful.\n\n 
				Initiator:${action_data?.oc}\n
				Target:${action_data?.targetOC}\n
				Action:  ${action_data?.action}\n
				Reason: ${action_data?.reason}\n
				Item: ${action_data?.item}\n
				Quantity: ${action_data?.quantity}\n
				Cost: ${action_data?.value}\n
				Balance After: ${action_data?.newBalance}\n
				RP Date: ${action_data?.rpDate}`);
		} catch (error) {
			console.error(error);

			return interaction.reply(`❌ ${action} failed. \n\nError: ${error}}`);
		}
	},
};
