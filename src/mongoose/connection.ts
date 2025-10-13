import mongoose from 'mongoose';
import { mongoURI } from '../config.json';

await mongoose.connect(mongoURI);
console.log('✅ Connected to MongoDB on Mac');

export const isDBConnected = (): boolean => {
	return mongoose.connection.readyState === 1;
};
