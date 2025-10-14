import OC from '../../models/OCSchema';
import Item, { type ItemDocument } from '../../models/ItemSchema';
import TransactionLog from '../../models/TransactionLogSchema';

export const modifyInventory = async ({
	OCName,
	itemName,
	quantityChange,
	action,
	reason,
}: {
	OCName: string;
	itemName: string;
	quantityChange: number;
	action: 'ADD' | 'REMOVE' | 'USE' | 'BUY' | 'SELL';
	reason?: string;
}) => {
	// Find the player and populate the inventory items
	const targetOC = await OC.findOne({ name: OCName }).populate<{
		item: ItemDocument;
	}>('inventory.item');

	if (!targetOC) throw new Error(`Player ${OCName} not found.`);

	// Find the item document
	const item = await Item.findOne({ name: itemName });
	if (!item) throw new Error(`Item ${itemName} not found.`);

	// Helper to get ObjectId whether populated or not
	const getItemId = item.id || item._id;

	// Find the inventory entry
	const invEntry = targetOC.inventory.find(
		(entry) => entry.item.id === getItemId || entry.item._id === getItemId
	);

	if (!invEntry && action !== 'BUY' && action !== 'ADD')
		throw new Error(`${OCName} does not have any ${itemName}.`);

	if (action === 'ADD') {
		if (invEntry) {
			invEntry.quantity += quantityChange;
		} else {
			targetOC.inventory.push({
				item: getItemId,
				quantity: quantityChange,
			});
		}
		await targetOC.save();

		await TransactionLog.create({
			oc: targetOC.name,
			item: item.id,
			quantity: quantityChange,
			action,
			reason,
			balanceAfter: targetOC.money,
		});
	}

	if (action === 'BUY') {
		if (item.cost * quantityChange > targetOC.money) {
			throw new Error(`${OCName}'s balance is too low.`);
		}

		targetOC.money -= item.cost * quantityChange;

		if (invEntry) {
			invEntry.quantity += quantityChange;
		} else {
			targetOC.inventory.push({
				item: getItemId,
				quantity: quantityChange,
			});
		}

		await targetOC.save();

		await TransactionLog.create({
			oc: targetOC.name,
			item: item.id,
			quantity: quantityChange,
			action,
			reason,
			balanceAfter: targetOC.money,
		});
	}
};
