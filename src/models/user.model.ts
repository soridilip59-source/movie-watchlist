import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  numeric_id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
}

const UserSchema = new Schema<IUser>({
  numeric_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  role: { type: String, default: 'user' },
  created_at: { type: Date, default: Date.now }
});

export const UserModel = model<IUser>('User', UserSchema);
