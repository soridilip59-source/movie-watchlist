import { Schema, model, Document } from 'mongoose';

export interface IWatchlist extends Document {
  numeric_id: number;
  family_id: number;
  movie_id: number;
  added_by_member_id?: number;
  status: 'want_to_watch' | 'watching' | 'watched';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  created_at: Date;
  watched_at?: Date;
}

const WatchlistSchema = new Schema<IWatchlist>({
  numeric_id: { type: Number, required: true, unique: true },
  family_id: { type: Number, required: true },
  movie_id: { type: Number, required: true },
  added_by_member_id: { type: Number },
  status: { type: String, enum: ['want_to_watch', 'watching', 'watched'], default: 'want_to_watch' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  notes: { type: String },
  created_at: { type: Date, default: Date.now },
  watched_at: { type: Date }
});

WatchlistSchema.index({ family_id: 1, movie_id: 1 }, { unique: true });

export const WatchlistModel = model<IWatchlist>('Watchlist', WatchlistSchema);
