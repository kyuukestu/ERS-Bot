import mongoose from 'mongoose';

const { Schema } = mongoose;

const itemSchema = new Schema(
	{
		name: { type: String, required: true },
		quantity: { type: Number, default: 1, min: 0 },
	},
	{
		_id: false, // so inventory items are embedded, not separate documents
	}
);

export default itemSchema; // not a model — embedded schema
