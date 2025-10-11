import mongoose, { Schema, Document, Model } from 'mongoose';
import { Counter } from './counter.model';

export interface IProblem extends Document {
  pid: number; // numeric auto-increment id
  title: string;
  descriptionMd: string; // markdown
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    pid: { type: Number, unique: true, index: true },
    title: { type: String, required: true },
    descriptionMd: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

ProblemSchema.pre('save', async function setAutoIncrement(next) {
  if (!this.isNew || this.pid) return next();
  const counter = await Counter.findByIdAndUpdate(
    'problem',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.pid = counter.seq;
  next();
});

export const Problem: Model<IProblem> =
  mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema);
