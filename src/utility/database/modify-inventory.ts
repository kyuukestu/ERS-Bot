import OC from '../../models/OCSchema';
import Item, { type ItemDocument } from '../../models/ItemSchema';
import TransactionLog from '../../models/TransactionLogSchema';

export enum action {
	ADD = 'ADD',
	REMOVE = 'REMOVE',
	DELETE = 'DELETE',
	BUY = 'BUY',
	SELL = 'SELL',
	TRADE = 'TRADE',
}
export const modifyInventory = async ({
	OCName,
	targetOC,
	itemName,
	quantityChange,
	action,
	reason,
	value,
}: {
	OCName: string;
	targetOC?: string | null;
	itemName?: string | null;
	quantityChange?: number;
	action: action;
	reason?: string | null;
	value?: number | null;
}) => {
	// Find the player and populate the inventory items
	const userOC = await OC.findOne({ name: OCName }).populate<{
		item: ItemDocument;
	}>('inventory.item');

	if (!userOC) throw new Error(`Player ${OCName} not found.`);

	// Find the item document
	const item = await Item.findOne({ name: itemName });
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

		const pushID = item._id;

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
		});
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
				tem: item._id,
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
		});
	}

	if (action === 'SELL') {
		if (!quantityChange) {
			throw new Error('Quantity must be specified.');
		}

		const invEntry = userOC.inventory.find((e) => e.item.equals(getItemId));
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
			userOC.inventory.pull({ item: getItemId });
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
		});

		return {
			item: item.name,
			newBalance: userOC.money,
		};
	}

	if (action === 'DELETE') {
		const invEntry = userOC.inventory.find((e) => e.item.equals(getItemId));
		if (!invEntry) throw new Error(`${OCName} does not have that item.`);

		userOC.inventory.pull({ item: getItemId });

		await userOC.save();

		await TransactionLog.create({
			oc: userOC._id,
			item: item._id,
			itemNameSnapshot: item.name,
			quantity: quantityChange,
			action,
			reason,
			balanceAfter: userOC.money,
		});
	}

	if (action === 'REMOVE') {
		if (!quantityChange) {
			throw new Error('Quantity must be specified.');
		}

		const invEntry = userOC.inventory.find((e) => e.item.equals(getItemId));
		if (!invEntry) throw new Error(`${OCName} does not have that item.`);

		if (invEntry.quantity < quantityChange)
			throw new Error(`${OCName} does not have enough ${itemName}.`);

		invEntry.quantity -= quantityChange;

		if (invEntry.quantity <= 0) {
			userOC.inventory.pull({ item: getItemId });
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
		});
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

			const invEntry = userOC.inventory.find((e) => e.item.equals(getItemId));
			if (!invEntry) throw new Error(`${OCName} does not have that item.`);
			if (invEntry.quantity < quantityChange)
				throw new Error(`${OCName} does not have enough ${itemName}.`);

			// Sender loses item(s)
			invEntry.quantity -= quantityChange;
			if (invEntry.quantity <= 0) userOC.inventory.pull({ item: getItemId });

			// Receiver gains item(s)
			const receiverInv = target.inventory.find((e) =>
				e.item.equals(getItemId)
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
			}),
			TransactionLog.create({
				oc: target._id,
				item: item._id,
				itemNameSnapshot: item.name,
				quantity: quantityChange || 0,
				action,
				reason: `Received from ${userOC.name}`,
				balanceAfter: target.money,
			}),
		]);
	}
};
