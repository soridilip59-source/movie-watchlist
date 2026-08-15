import { Schema, model, Document } from 'mongoose';

export interface IMovie extends Document {
  numeric_id: number;
  title: string;
  release_year: number;
  genres: string;
  content_rating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  duration_minutes: number;
  synopsis: string;
  director: string;
  poster_url?: string;
  streaming_services: string;
  imdb_rating: number;
  created_at: Date;
}

const MovieSchema = new Schema<IMovie>({
  numeric_id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  release_year: { type: Number, required: true },
  genres: { type: String, required: true },
  content_rating: { type: String, enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'], required: true },
  duration_minutes: { type: Number, required: true },
  synopsis: { type: String, required: true },
  director: { type: String, required: true },
  poster_url: { type: String },
  streaming_services: { type: String, required: true },
  imdb_rating: { type: Number, default: 0.0 },
  created_at: { type: Date, default: Date.now }
});

export const MovieModel = model<IMovie>('Movie', MovieSchema);
