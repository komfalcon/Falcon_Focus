import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { UserModel, type IUser } from "../models/user.model";
import { SessionModel } from "../models/session.model";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
} from "../utils/jwt.utils";
import { sendPasswordResetEmail } from "../utils/email.utils";

const MONGODB_URI = process.env.MONGODB_URI || "";

let mongoConnected = false;

export async function connectMongoDB(): Promise<void> {
  if (mongoConnected || !MONGODB_URI) return;
  try {
    await mongoose.connect(MONGODB_URI);
    mongoConnected = true;
    console.log("[MongoDB] Connected successfully");
  } catch (error) {
    console.error("[MongoDB] Connection failed:", error);
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    altitude: number;
    level: string;
    streak: number;
    feathers: number;
  };
  tokens: AuthTokens;
}

function formatUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    altitude: user.altitude,
    level: user.level,
    streak: user.streak,
    feathers: user.feathers,
  };
}

async function generateTokens(user: IUser): Promise<AuthTokens> {
  const payload = { userId: user._id.toString(), email: user.email };
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);

  // Store refresh token
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await SessionModel.create({ userId: user._id, refreshToken, expiresAt });

  return { accessToken, refreshToken };
}

export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  await connectMongoDB();

  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await UserModel.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
  });

  const tokens = await generateTokens(user);
  return { user: formatUser(user), tokens };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  await connectMongoDB();

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const tokens = await generateTokens(user);
  return { user: formatUser(user), tokens };
}

export async function googleSignIn(
  googleId: string,
  email: string,
  name: string,
  avatar?: string,
): Promise<AuthResult> {
  await connectMongoDB();

  let user = await UserModel.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

  if (!user) {
    user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      googleId,
      avatar,
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    if (avatar) user.avatar = avatar;
    await user.save();
  }

  const tokens = await generateTokens(user);
  return { user: formatUser(user), tokens };
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  await connectMongoDB();

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new Error("Invalid refresh token");
  }

  const session = await SessionModel.findOne({ refreshToken });
  if (!session || session.expiresAt < new Date()) {
    throw new Error("Refresh token expired or not found");
  }

  const user = await UserModel.findById(payload.userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Rotate refresh token
  await SessionModel.deleteOne({ refreshToken });
  return generateTokens(user);
}

export async function forgotPassword(email: string): Promise<void> {
  await connectMongoDB();

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return silently to avoid revealing if email exists
    return;
  }

  const resetToken = await signPasswordResetToken(user._id.toString(), user.email);
  await sendPasswordResetEmail(user.email, resetToken);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await connectMongoDB();

  const payload = await verifyPasswordResetToken(token);
  if (!payload) {
    throw new Error("Invalid or expired reset token");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await UserModel.findByIdAndUpdate(payload.userId, { passwordHash });

  // Invalidate all existing sessions for this user
  await SessionModel.deleteMany({ userId: new mongoose.Types.ObjectId(payload.userId) });
}
