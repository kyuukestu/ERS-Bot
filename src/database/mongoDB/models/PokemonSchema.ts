import mongoose, { Document } from 'mongoose';

const { Schema, model } = mongoose;

export interface PokemonDocument extends Document {
	species: string;
	nickname?: string;
	level: number;
	fortitude_drain: number;
	inBox: boolean;
	gender: 'Male' | 'Female' | 'Genderless' | 'Unknown';
	nature?: string;
	ability: string[];
	shiny: boolean;
	moves: string[];
	bst: number;
	stats: {
		hp: number;
		attack: number;
		defense: number;
		spAttack: number;
		spDefense: number;
		speed: number;
	};
	createdAt: Date;
	updatedAt: Date;
}

const pokemonSchema = new Schema(
	{
		species: { type: String, required: true },
		nickname: { type: String },
		level: { type: Number, default: 1, min: 1, max: 100 },
		fortitude_drain: {
			type: Number,
			default: 0,
		},
		inBox: { type: Boolean, default: false },
		gender: {
			type: String,
			enum: ['Male', 'Female', 'Genderless', 'Unknown'],
			default: 'Unknown',
		},
		nature: { type: String },
		ability: { type: [String], default: [] },
		shiny: { type: Boolean, default: false },
		alpha: { type: Boolean, default: false },
		moves: {
			type: [String], // e.g. ['Thunderbolt', 'Quick Attack']
			default: [],
		},
		bst: {
			type: Number,
			default: 0,
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
