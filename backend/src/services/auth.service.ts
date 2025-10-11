import { User } from '../models/user.model';
import { Session } from '../models/session.model';
import { hashPassword, verifyPassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';

export async function registerUser(input: { email: string; username: string; password: string }) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new ConflictError('Email already in use');
  const passwordHash = await hashPassword(input.password);
  const user = await User.create({ email: input.email, username: input.username, passwordHash });
  return sanitizeUser(user);
}

export async function loginUser(input: {
  email: string;
  password: string;
  userAgent?: string;
  ip?: string;
}) {
  const user = await User.findOne({ email: input.email });
  if (!user) throw new UnauthorizedError('Invalid credentials');
  const ok = await verifyPassword(user.passwordHash, input.password);
  if (!ok) throw new UnauthorizedError('Invalid credentials');

  const session = await Session.create({
    user: user._id,
    userAgent: input.userAgent,
    ip: input.ip,
  });
  const accessToken = signAccessToken(String(user._id));
  const refreshToken = signRefreshToken(String(user._id), String(session._id));
  return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function refreshTokens(token: string, meta?: { userAgent?: string; ip?: string }) {
  let decoded: ReturnType<typeof verifyRefreshToken>;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }
  const session = await Session.findById(decoded.sid);
  if (!session || session.revokedAt) throw new UnauthorizedError('Refresh session revoked');

  // rotate session id
  session.revokedAt = new Date();
  await session.save();
  const newSession = await Session.create({
    user: session.user,
    userAgent: meta?.userAgent,
    ip: meta?.ip,
  });

  const accessToken = signAccessToken(String(session.user));
  const refreshToken = signRefreshToken(String(session.user), String(newSession._id));
  return { accessToken, refreshToken };
}

export async function logout(refreshToken: string) {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    await Session.findByIdAndUpdate(decoded.sid, { $set: { revokedAt: new Date() } });
  } catch {
    // ignore invalid token on logout for idempotency
  }
}

export async function getUserById(id: string) {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('User not found');
  return sanitizeUser(user);
}

function sanitizeUser(user: any) {
  return {
    id: String(user._id),
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
