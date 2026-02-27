import { Document, Schema, model, Types } from 'mongoose';

export interface ServiceDocument extends Document {
	name: string;

	cost: number;
}

const ServiceSchema = new Schema<ServiceDocument>({
	_id: { type: Types.ObjectId, auto: true },
	name: { type: String, required: true, unique: true },
	cost: { type: Number, required: true, default: 0 },
});

export default model<ServiceDocument>('Service', ServiceSchema);
