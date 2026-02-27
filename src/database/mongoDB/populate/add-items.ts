import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Item, { type ItemDocument } from '~/database/models/ItemSchema';
import { mongoURI, adminURI, sshmongoURI } from '~/config.json';
// 1. Connect to MongoDB
await mongoose.connect(mongoURI || adminURI || sshmongoURI);
console.log('✅ Connected to MongoDB');

// 2. Load JSON
const filePath = path.join(__dirname, '../../../public/json/items-list.json');
const rawData = fs.readFileSync(filePath, 'utf-8');
const items: Partial<ItemDocument>[] = JSON.parse(rawData);

// 3. Insert into MongoDB
try {
	const inserted = await Item.insertMany(items, { ordered: false });
	console.log(`✅ Inserted ${inserted.length} items into MongoDB`);
} catch (err) {
	console.error('❌ Error inserting items:', err);
}

// 4. Close connection
await mongoose.disconnect();
console.log('🔌 Disconnected from MongoDB');
