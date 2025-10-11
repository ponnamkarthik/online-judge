import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB() {
  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) return;
  await mongoose.connect(env.MONGODB_URI);
  // eslint-disable-next-line no-console
  console.log('✅ MongoDB connected');
}
