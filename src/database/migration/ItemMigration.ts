import Item from '~/database/models/ItemSchema';
import { connectDB } from '~/database/mongoose/connection'; // use your existing connection util

async function migrateItemIds() {
	try {
		await connectDB();
		console.log('Connected to DB');

		const items = await Item.find({});

		for (const item of items) {
			// Check if id is still a number
			if (typeof item.id === 'number') {
				// Convert number to string
				item.id = item.id.toString();
				await item.save();
				console.log(`Updated item "${item.name}" id to string`);
			}
		}

		console.log('Migration completed!');
	} catch (err) {
		console.error('Migration failed:', err);
		process.exit(1);
	}
}

migrateItemIds();
