import mongoose, { Document, Schema } from 'mongoose';

export interface apiKeyDocument extends Document {
  RapidAPI_Key: string;
  RapidAPI_Host : string,
  time : string
}

const apiSchema = new Schema<apiKeyDocument>({
  RapidAPI_Key: { type: String, required: true },
  RapidAPI_Host: { type: String, required: true },
  time : {type : String, default : '30 2 * * *'}
});

export const API = mongoose.model<apiKeyDocument>('API', apiSchema);
