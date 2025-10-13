import mongoose from 'mongoose';
import Pokemon from './pokemonSchema';
import itemSchema from './ItemSchema';

const { Schema, model, Types } = mongoose;

const OCSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true, // optional: if usernames must be unique
		},

		money: {
			type: Number,
			default: 0,
			min: 0,
		},

		inventory: {
			type: [itemSchema], // e.g. ['Potion', 'Poké Ball', 'Revive']
			default: [],
		},

		party: [
			{
				type: Types.ObjectId,
				ref: Pokemon,
			},
		],

		storage: [
			{
				type: Types.ObjectId,
				ref: Pokemon,
			},
		],
	},
	{
		timestamps: true, // adds createdAt and updatedAt
	}
);

export default model('OC', OCSchema);
