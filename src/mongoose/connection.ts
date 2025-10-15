import mongoose from 'mongoose';
import { mongoURI, adminURI } from '../config.json';

export const isDBConnected = (): boolean => {
	return mongoose.connection.readyState === 1;
};

export const connectDB = async () => {
	await mongoose.connect(mongoURI || adminURI);
	console.log('✅ Connected to MongoDB on Mac');
};
