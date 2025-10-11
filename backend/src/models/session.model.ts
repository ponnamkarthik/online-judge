import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISession extends Document {
  user: Types.ObjectId;
  userAgent?: string;
  ip?: string;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userAgent: { type: String },
    ip: { type: String },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

export const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
