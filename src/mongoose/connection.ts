import mongoose from 'mongoose';
import { mongoURI, adminURI } from '../config.json';

await mongoose.connect(mongoURI || adminURI);
console.log('✅ Connected to MongoDB on Mac');

export const isDBConnected = (): boolean => {
	return mongoose.connection.readyState === 1;
};
