import mongoose from 'mongoose';
import itemSchema from './ItemSchema';

const { Schema, model, Types } = mongoose;

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

const OCSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true, // optional: if usernames must be unique
			index: true, // optional: for faster querying by username
		},

		nickname: {
			type: String,
			trim: true,
		},

		money: {
			type: Number,
			default: 0,
			min: 0,
		},

		rank: {
			type: String,
			enum: Object.values(Rank),
			default: 'Bronze',
		},
		tier: {
			type: Number,
			default: 1,
			min: 1,
			max: 5,
		},

		fortitude: {
			current: {
				type: Number,
				default: 50,
				min: 0,
			},
			max: {
				type: Number,
				default: 50,
			},
		},

		inventory: {
			type: [itemSchema], // e.g. ['Potion', 'Poké Ball', 'Revive']
			default: [],
		},

		party: {
			type: [
				{
					pokemon: { type: Types.ObjectId, ref: 'Pokemon' },
					nickname: { type: String, default: '' },
					species: { type: String, required: true },
					level: { type: Number, default: 1 },
					drain: { type: Number, default: 0 },
				},
			],
			validate: {
				validator: function (arr: any[]) {
					return arr.length <= 6;
				},
				message: 'Party can have a maximum of 6 Pokémon.',
			},
			default: [],
		},

		storage: [
			{
				pokemon: {
					type: Types.ObjectId,
					ref: 'Pokemon',
				},
				nickname: { type: String, default: '' },
				species: {
					type: String,
					required: true,
				},
				level: {
					type: Number,
					default: 1,
					min: 1,
				},
				drain: {
					type: Number,
					default: 0,
				},
			},
		],
	},
	{
		timestamps: true, // adds createdAt and updatedAt
	}
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
