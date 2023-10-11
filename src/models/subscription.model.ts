// subscription.model.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface SubscriptionDocument extends Document {
  userId: number;
  city: string;
  apiCallCount : number
}

const subscriptionSchema = new Schema<SubscriptionDocument>({
  userId: { type: Number, required: true },
  city: { type: String, required: true },
  apiCallCount: { type: Number, default: 0 },
});

export const Subscription = mongoose.model<SubscriptionDocument>('Subscription', subscriptionSchema);
