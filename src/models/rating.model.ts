import { Schema, model, Document } from 'mongoose';

export interface IRating extends Document {
  numeric_id: number;
  movie_id: number;
  member_id: number;
  rating: number;
  review_text?: string;
  created_at: Date;
}

const RatingSchema = new Schema<IRating>({
  numeric_id: { type: Number, required: true, unique: true },
  movie_id: { type: Number, required: true },
  member_id: { type: Number, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review_text: { type: String },
  created_at: { type: Date, default: Date.now }
});

RatingSchema.index({ movie_id: 1, member_id: 1 }, { unique: true });

export const RatingModel = model<IRating>('Rating', RatingSchema);
