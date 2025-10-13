import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const pokemonSchema = new Schema(
	{
		species: { type: String, required: true },
		nickname: { type: String },
		level: { type: Number, default: 1, min: 1, max: 100 },
		gender: {
			type: String,
			enum: ['Male', 'Female', 'Unknown'],
			default: 'Unknown',
		},
		nature: { type: String },
		ability: { type: String },
		shiny: { type: Boolean, default: false },
		moves: {
			type: [String], // e.g. ['Thunderbolt', 'Quick Attack']
			default: [],
		},
		stats: {
			hp: { type: Number, default: 0 },
			attack: { type: Number, default: 0 },
			defense: { type: Number, default: 0 },
			spAttack: { type: Number, default: 0 },
			spDefense: { type: Number, default: 0 },
			speed: { type: Number, default: 0 },
		},
	},
	{
		timestamps: true,
	}
);

export default model('Pokemon', pokemonSchema);
