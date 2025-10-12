import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITestCase extends Document {
  problem: Types.ObjectId;
  input: string; // stdin
  expectedOutput: string; // exact match after trim
  isSample: boolean;
  timeLimitMs: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestCaseSchema = new Schema<ITestCase>(
  {
    problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isSample: { type: Boolean, default: false },
    timeLimitMs: { type: Number, default: 2000 },
  },
  { timestamps: true }
);

export const TestCase: Model<ITestCase> =
  mongoose.models.TestCase || mongoose.model<ITestCase>('TestCase', TestCaseSchema);
