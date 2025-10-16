import { Schema, model, Types } from 'mongoose';

const serviceLogSchema = new Schema(
	{
		oc: {
			type: Types.ObjectId,
			ref: 'OC',
			required: true,
		},
		service: {
			type: Schema.Types.Mixed,
			ref: 'Item',
			required: true,
		},
		serviceNameSnapshot: { type: String, required: true }, // store name in case item is deleted
		quantity: { type: Number, default: 1, min: 1 },
		action: {
			type: String,
			enum: ['BUY', 'SELL', 'TRADE'],
			required: true,
		},
		reason: { type: String, default: '' },
		balanceAfter: { type: Number, default: 0 },
	},
	{
		timestamps: true,
	}
);

export default model('ServiceLog', serviceLogSchema);
