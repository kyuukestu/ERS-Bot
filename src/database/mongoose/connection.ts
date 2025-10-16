import mongoose from 'mongoose';
import { mongoURI, adminURI, sshmongoURI } from '../../config.json';

export const isDBConnected = (): boolean => {
	return mongoose.connection.readyState === 1;
};

export const connectDB = async () => {
	await mongoose.connect(mongoURI || adminURI || sshmongoURI);
	console.log('✅ Connected to MongoDB on Mac');
};
