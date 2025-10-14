import { Document, Types, Schema, model } from 'mongoose';
import type { ItemDocument } from './ItemSchema';
import type { PokemonDocument } from './PokemonSchema';

export enum Rank {
	'Bronze',
	'Silver',
	'Gold',
	'Platinum',
	'Master',
	'High Master',
	'Grand Master',
	'Legendary',
}

// Inventory entry
export interface InventoryEntry {
	item: Types.ObjectId | ItemDocument; // can be populated
	quantity: number;
}

export type InventorySubdoc = InventoryEntry & Types.Subdocument;

// Party/Storage entry
export interface PokemonEntry {
	pokemon: Types.ObjectId | PokemonDocument; // can be populated
	nickname: string;
	species: string;
	level: number;
	drain: number;
}

// OC Document interface
export interface OCDocument extends Document {
	name: string;
	nickname?: string;
	money: number;
	rank: Rank | string;
	tier: number;
	fortitude: {
		current: number;
		max: number;
	};
	inventory: Types.DocumentArray<InventorySubdoc>;
	party: Types.DocumentArray<PokemonEntry>;
	storage: Types.DocumentArray<PokemonEntry>;
}

const inventorySchema = new Schema<InventoryEntry>(
	{
		item: { type: Types.ObjectId, ref: 'Item', required: true },
		quantity: { type: Number, default: 1, min: 0 },
	},
	{ _id: false }
);

const pokemonEntrySchema = new Schema<PokemonEntry>(
	{
		pokemon: { type: Types.ObjectId, ref: 'Pokemon' },
		nickname: { type: String, default: '' },
		species: { type: String, required: true },
		level: { type: Number, default: 1 },
		drain: { type: Number, default: 0 },
	},
	{ _id: false }
);

const OCSchema = new Schema<OCDocument>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			index: true,
		},
		nickname: { type: String, trim: true },
		money: { type: Number, default: 0, min: 0 },
		rank: { type: String, enum: Object.values(Rank), default: 'Bronze' },
		tier: { type: Number, default: 1, min: 1, max: 5 },
		fortitude: {
			current: { type: Number, default: 50, min: 0 },
			max: { type: Number, default: 50 },
		},
		inventory: [inventorySchema],
		party: {
			type: [pokemonEntrySchema],
			default: [],
			validate: {
				validator: (arr: PokemonEntry[]) => arr.length <= 6,
				message: 'Party can have a maximum of 6 Pokémon.',
			},
		},
		storage: [pokemonEntrySchema],
	},
	{ timestamps: true }
);

OCSchema.pre('save', function (next) {
	const rankMaxFortitude: Record<string, number> = {
		'Bronze 1': 50,
		'Bronze 2': 87,
		'Bronze 3': 130,
		'Bronze 4': 183,
		'Bronze 5': 250,
		'Silver 1': 300,
		'Silver 2': 415,
		'Silver 3': 570,
		'Silver 4': 783,
		'Silver 5': 1077,
	};

	const key = `${this.rank} ${this.tier}`;

	const newMax = rankMaxFortitude[key] ?? 50;

	if (!this.fortitude) {
		this.fortitude = {
			current: newMax,
			max: newMax,
		};
	} else {
		if (this.fortitude.max !== newMax) {
			this.fortitude.max = newMax;
		}
	}
	next();
});

export default model('OC', OCSchema);
