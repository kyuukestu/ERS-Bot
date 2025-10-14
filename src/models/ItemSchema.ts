import { Document, Schema, model } from 'mongoose';

export interface EffectEntry {
	effect: string;
	short_effect: string;
	language: string;
}

export interface ItemDocument extends Document {
	id: number;
	name: string;
	category: string;
	cost: number;
	attributes: string[];
	effect_entries: EffectEntry[];
	flavor_text_entries: string[];
	sprites: string;
}

const EffectEntrySchema = new Schema<EffectEntry>({
	effect: { type: String, required: true },
	short_effect: { type: String, required: true },
	language: { type: String, required: true },
});

const ItemSchema = new Schema<ItemDocument>({
	id: { type: Number, required: true, unique: true },
	name: { type: String, required: true, unique: true },
	category: { type: String, required: true },
	cost: { type: Number, required: true, default: 0 },
	attributes: { type: [String], default: [] },
	effect_entries: { type: [EffectEntrySchema], default: [] },
	flavor_text_entries: { type: [String], default: [] },
	sprites: { type: String, default: '' },
});

export default model<ItemDocument>('Item', ItemSchema);
