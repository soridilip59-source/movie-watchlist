import { Schema, model, Document } from 'mongoose';

export interface IMember {
  id?: number;
  name: string;
  role: 'Parent' | 'Teen' | 'Kid' | 'Other';
  age: number;
  max_rating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  avatar_emoji: string;
}

export interface IFamily extends Document {
  numeric_id: number;
  name: string;
  members: IMember[];
  created_at: Date;
}

const MemberSchema = new Schema<IMember>({
  id: { type: Number },
  name: { type: String, required: true },
  role: { type: String, enum: ['Parent', 'Teen', 'Kid', 'Other'], required: true },
  age: { type: Number, required: true },
  max_rating: { type: String, enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'], required: true },
  avatar_emoji: { type: String, default: '👤' }
});

const FamilySchema = new Schema<IFamily>({
  numeric_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  members: [MemberSchema],
  created_at: { type: Date, default: Date.now }
});

export const FamilyModel = model<IFamily>('Family', FamilySchema);
