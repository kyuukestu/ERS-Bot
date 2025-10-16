import { Schema, model, Types } from 'mongoose';

const transactionLogSchema = new Schema(
	{
		oc: {
			type: Types.ObjectId,
			ref: 'OC',
			required: true,
		},
		item: {
			type: Types.ObjectId,
			ref: 'Item',
			required: true,
		},
		itemNameSnapshot: { type: String, required: true }, // store name in case item is deleted
		quantity: { type: Number, required: true },
		action: {
			type: String,
			enum: ['ADD', 'REMOVE', 'USE', 'BUY', 'SELL', 'TRADE'],
			required: true,
		},
		reason: { type: String, default: '' },
		balanceAfter: { type: Number, default: 0 },
		rpDate: { type: Date, required: true },
	},
	{
		timestamps: true,
	}
);

export default model('TransactionLog', transactionLogSchema);
