import OC from '~/database/models/OCSchema';
import Item, { type ItemDocument } from '~/database/models/ItemSchema';
import Service, { type ServiceDocument } from '~/database/models/ServiceSchema';
import TransactionLog from '~/database/models/TransactionLogSchema';
import ServiceLog from '~/database/models/ServiceLogSchema';
import { v4 as uuidv4 } from 'uuid';
import { parse, isValid } from 'date-fns';

export enum action {
	ADD = 'ADD',
	REMOVE = 'REMOVE',
	DELETE = 'DELETE',
	BUY = 'BUY',
	SELL = 'SELL',
	TRADE = 'TRADE',
}
export const processTransaction = async ({
	OCName,
	targetOC,
	itemName,
	serviceName,
	quantityChange,
	action,
	reason,
	value,
	customItem,
	isLeagueService,
	isService,
	rpDate,
}: {
	OCName: string;
	targetOC?: string | null;
	itemName?: string | null;
	serviceName?: string | null;
	quantityChange?: number;
	action: action;
	reason?: string | null;
	value?: number | null;
	customItem?: boolean;
	isLeagueService?: boolean;
	isService?: boolean;
	rpDate: string;
}) => {
	const parseDate = parse(rpDate, 'yyyy-MM-dd', new Date());

	if (!isValid(parseDate)) throw new Error('Not a valid calendar date!');

	if (isService) {
		if (!serviceName) throw new Error('Service name must be specified!');
		if (!quantityChange) throw new Error('Quantity change must be specified!');
		if (quantityChange <= 0)
			throw new Error('Quantity change must be positive.');

		const allowedActions = ['BUY', 'SELL', 'TRADE'];

		if (!allowedActions.includes(action))
			throw new Error('Services can only be bought, sold, or traded!!');

		const userOC = await OC.findOne({ name: OCName });

		if (!userOC) throw new Error(`Player ${OCName} not found.`);

		if (!isLeagueService) {
			if (!value) throw new Error('Non-League services require a value!');

			userOC.money -= value ?? 0;

			await userOC.save();

			await ServiceLog.create({
				oc: userOC._id,
				service: uuidv4(),
				serviceNameSnapshot: serviceName,
				quantity: quantityChange,
				action,
				reason,
				balanceAfter: userOC.money,
				rpDate: parseDate,
			});

			return {
				item: serviceName,
				quantity: quantityChange,
				newBalance: userOC.money,
				oc: OCName,
				targetOC,
				action,
				reason,
				value,
				rpDate: parseDate,
			};
		}

		const service = await Service.findOne<ServiceDocument>({
			name: serviceName,
		});

		if (!service) throw new Error(`Service ${serviceName} not found.`);

		userOC.money -= service.cost ?? 0;

		await userOC.save();

		await ServiceLog.create({
			oc: userOC._id,
			service: service._id,
			serviceNameSnapshot: serviceName,
			quantity: quantityChange,
			action,
			reason,
			balanceAfter: userOC.money,
			rpDate: parseDate,
		});

		return {
			item: serviceName,
			quantity: quantityChange,
			newBalance: userOC.money,
			oc: OCName,
			targetOC,
			action,
			reason,
			value: service.cost,
			rpDate: parseDate,
		};
	}

	// Find the player and populate the inventory items
	const userOC = await OC.findOne({ name: OCName }).populate<{
		item: ItemDocument;
	}>('inventory.item');

	if (!userOC) throw new Error(`Player ${OCName} not found.`);

	if (customItem) {
		if (!itemName) throw new Error('Item name must be specified.');
		if (!quantityChange) throw new Error('Quantity change must be specified.');
		if (quantityChange <= 0)
			throw new Error('Quantity change must be positive.');

		if (!value) throw new Error('Value must be specified.');

		userOC.money -= value * quantityChange;

		const customTemplate = await Item.create({
			name: 'custom-item',
			category: 'custom',
			cost: 0,
			attributes: [],
			effect_entries: [],
			flavor_text_entries: [],
			sprites: '',
		});

		await userOC.save();

		await TransactionLog.create({
			oc: userOC._id,
			item: customTemplate._id,
			itemNameSnapshot: itemName,
			quantity: quantityChange,
			action,
			reason,
			balanceAfter: userOC.money,
			rpDate: parseDate,
		});

		return {
			item: itemName,
			quantity: quantityChange,
			newBalance: userOC.money,
			oc: OCName,
			targetOC,
			action,
			reason,
			rpDate: parseDate,
		};
	}
	itemName = itemName?.toLowerCase();

	// Find the item document
	const item = await Item.findOne<ItemDocument>({ name: itemName });
	if (!item) throw new Error(`Item ${itemName} not found.`);

	// Helper to get ObjectId whether populated or not
	const getItemId = item.id;

	// Find the inventory entry
	const invEntry = userOC.inventory.find(
		(entry) => entry.item.id === getItemId
	);

	if (!invEntry && action !== 'BUY' && action !== 'ADD')
		throw new Error(`${OCName} does not have any ${itemName}.`);

	if (action === 'ADD') {
		if (!quantityChange) {
			throw new Error('Quantity must be specified.');
		}

		if (invEntry) {
			invEntry.quantity += quantityChange;
		} else {
			userOC.inventory.push({
				item: item._id,
				quantity: quantityChange,
			});
		}
		await userOC.save();

		await TransactionLog.create({
			oc: userOC._id,
			item: item._id,
			itemNameSnapshot: item.name,
			quantity: quantityChange,
			action,
			reason,
			balanceAfter: userOC.money,
			rpDate: parseDate,
		});

		return {
			item: item.name,
			quantity: quantityChange,
			newBalance: userOC.money,
			oc: OCName,
			targetOC,
			action,
			reason,
			value,
			rpDate: parseDate,
		};
	}

	if (action === 'BUY') {
		if (!quantityChange) {
			throw new Error('Quantity must be specified.');
		}

		if (item.cost * quantityChange > userOC.money) {
			throw new Error(`${OCName}'s balance is too low.`);
		}

		userOC.money -= item.cost * quantityChange;

		if (invEntry) {
			invEntry.quantity += quantityChange;
		} else {
			userOC.inventory.push({
				item: item._id,
				quantity: quantityChange,
			});
		}

		await userOC.save();

		await TransactionLog.create({
			oc: userOC._id,
			item: item._id,
			itemNameSnapshot: item.name,
			quantity: quantityChange,
			action,
			reason,
			balanceAfter: userOC.money,
			rpDate: parseDate,
		});

		return {
			item: item.name,
			quantity: quantityChange,
			newBalance: userOC.money,
			oc: OCName,
			targetOC,
			action,
			reason,
			value: item.cost || value,
			rpDate: parseDate,
		};
	}

	if (action === 'SELL') {
		if (!quantityChange) {
			throw new Error('Quantity must be specified.');
		}

		const invEntry = userOC.inventory.find(
			(entry) => entry.item.id === getItemId
		);
		if (!invEntry) {
			throw new Error(`${OCName} does not have that item.`);
		}

		if (invEntry.quantity < quantityChange) {
			throw new Error(`${OCName} does not have enough ${itemName} to sell.`);
		}

		// Increase OC's money by half the item's cost
		const totalSaleValue = Math.floor((item.cost / 2) * quantityChange);
		userOC.money += totalSaleValue;

		// Subtract sold quantity
		invEntry.quantity -= quantityChange;

		// Remove item entirely if depleted
		if (invEntry.quantity <= 0) {
			userOC.inventory.pull({ item: item._id });
		}

		await userOC.save();

		// Record the transaction
		await TransactionLog.create({
			oc: userOC._id, // better to reference by ObjectId
			item: item._id,
			itemNameSnapshot: item.name,
			quantity: -quantityChange, // negative to indicate reduction
			action: 'SELL',
			reason: reason ?? `Sold ${quantityChange}x ${item.name}`,
			balanceAfter: userOC.money,
			rpDate: parseDate,
		});

		return {
			item: item.name,
			quantity: quantityChange,
			newBalance: userOC.money,
			oc: OCName,
			targetOC,
			action,
			reason,
			value: item.cost || value,
			rpDate: parseDate,
		};
	}

	if (action === 'DELETE') {
		const invEntry = userOC.inventory.find(
			(entry) => entry.item.id === getItemId
		);
		if (!invEntry) throw new Error(`${OCName} does not have that item.`);

		userOC.inventory.pull({ item: item._id });

		await userOC.save();

		await TransactionLog.create({
			oc: userOC._id,
			item: item._id,
			itemNameSnapshot: item.name,
			quantity: quantityChange,
			action,
			reason,
			balanceAfter: userOC.money,
			rpDate: parseDate,
		});

		return {
			item: item.name,
			quantity: quantityChange,
			newBalance: userOC.money,
			oc: OCName,
			targetOC,
			action,
			reason,
			value: item.cost || value,
			rpDate: parseDate,
		};
	}

	if (action === 'REMOVE') {
		if (!quantityChange) {
			throw new Error('Quantity must be specified.');
		}

		const invEntry = userOC.inventory.find(
			(entry) => entry.item.id === getItemId
		);
		if (!invEntry) throw new Error(`${OCName} does not have that item.`);

		if (invEntry.quantity < quantityChange)
			throw new Error(`${OCName} does not have enough ${itemName}.`);

		invEntry.quantity -= quantityChange;

		if (invEntry.quantity <= 0) {
			userOC.inventory.pull({ item: item._id });
		}

		await userOC.save();

		await TransactionLog.create({
			oc: userOC._id,
			item: item._id,
			itemNameSnapshot: item.name,
			quantity: quantityChange,
			action,
			reason,
			balanceAfter: userOC.money,
			rpDate: parseDate,
		});

		return {
			item: item.name,
			quantity: quantityChange,
			newBalance: userOC.money,
			oc: OCName,
			targetOC,
			action,
			reason,
			value: item.cost || value,
			rpDate: parseDate,
		};
	}

	if (action === 'TRADE') {
		if (!value && !itemName) {
			throw new Error('Trade value or item must be specified!');
		}

		const target = await OC.findOne({ name: targetOC }).populate<{
			item: ItemDocument;
		}>('inventory.item');
		if (!target) throw new Error("Target OC doesn't exist!");
		if (target.name === OCName)
			throw new Error('You cannot trade with yourself.');

		// 🧩 Handle item trades
		if (itemName) {
			if (quantityChange === undefined || quantityChange <= 0) {
				throw new Error('Quantity must be a positive number for item trades.');
			}

			const invEntry = userOC.inventory.find(
				(entry) => entry.item.id === getItemId
			);
			if (!invEntry) throw new Error(`${OCName} does not have that item.`);
			if (invEntry.quantity < quantityChange)
				throw new Error(`${OCName} does not have enough ${itemName}.`);

			// Sender loses item(s)
			invEntry.quantity -= quantityChange;
			if (invEntry.quantity <= 0) userOC.inventory.pull({ item: getItemId });

			// Receiver gains item(s)
			const receiverInv = target.inventory.find(
				(entry) => entry.item.id === getItemId
			);
			if (receiverInv) receiverInv.quantity += quantityChange;
			else target.inventory.push({ item: item._id, quantity: quantityChange });
		}

		// 🪙 Handle money trades
		if (value) {
			if (value <= 0) throw new Error('Trade value must be a positive number.');
			if (userOC.money < value)
				throw new Error(
					`${OCName} does not have enough money to trade ${value}.`
				);

			userOC.money -= value;
			target.money += value;
		}

		await Promise.all([userOC.save(), target.save()]);

		await Promise.all([
			TransactionLog.create({
				oc: userOC._id,
				item: item._id,
				itemNameSnapshot: item.name,
				quantity: quantityChange || 0,
				action,
				reason: `Traded to ${target.name}`,
				balanceAfter: userOC.money,
				rpDate: parseDate,
			}),
			TransactionLog.create({
				oc: target._id,
				item: item._id,
				itemNameSnapshot: item.name,
				quantity: quantityChange || 0,
				action,
				reason: `Received from ${userOC.name}`,
				balanceAfter: target.money,
				rpDate: parseDate,
			}),
		]);

		return {
			item: item.name,
			quantity: quantityChange,
			newBalance: userOC.money,
			oc: OCName,
			targetOC,
			action,
			reason,
			value: item.cost || value,
			rpDate: parseDate,
		};
	}
};
