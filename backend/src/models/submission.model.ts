import mongoose, { Schema, Types } from 'mongoose';

export type SubmissionResult = {
  case: number;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  pass: boolean;
  durationMs: number;
};

export interface SubmissionDocument extends mongoose.Document {
  user: Types.ObjectId;
  problem: Types.ObjectId;
  pid: number;
  language: 'javascript' | 'typescript' | 'python' | 'cpp' | 'java';
  code: string;
  total: number;
  passed: boolean;
  results: SubmissionResult[];
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionResultSchema = new Schema<SubmissionResult>(
  {
    case: { type: Number, required: true },
    stdout: { type: String, default: '' },
    stderr: { type: String, default: '' },
    exitCode: { type: Number, default: null },
    timedOut: { type: Boolean, required: true },
    pass: { type: Boolean, required: true },
    durationMs: { type: Number, required: true },
  },
  { _id: false }
);

const SubmissionSchema = new Schema<SubmissionDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    pid: { type: Number, required: true, index: true },
    language: {
      type: String,
      enum: ['javascript', 'typescript', 'python', 'cpp', 'java'],
      required: true,
    },
    code: { type: String, required: true, maxlength: 200000 },
    total: { type: Number, required: true },
    passed: { type: Boolean, required: true, index: true },
    results: { type: [SubmissionResultSchema], default: [] },
  },
  { timestamps: true }
);

export const Submission = mongoose.model<SubmissionDocument>('Submission', SubmissionSchema);
