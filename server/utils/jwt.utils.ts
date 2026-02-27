import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../_core/env";

const getSecret = (secret: string) => new TextEncoder().encode(secret);

const JWT_SECRET = ENV.jwtSecret;
const JWT_REFRESH_SECRET = ENV.jwtRefreshSecret;
const JWT_EXPIRES_IN = ENV.jwtExpiresIn;
const JWT_REFRESH_EXPIRES_IN = ENV.jwtRefreshExpiresIn;

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    default:
      return value;
  }
}

export interface JwtPayload {
  userId: string;
  email: string;
  type: "access" | "refresh";
}

export async function signAccessToken(payload: Omit<JwtPayload, "type">): Promise<string> {
  const expirationSeconds = parseDuration(JWT_EXPIRES_IN);
  return new SignJWT({ ...payload, type: "access" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirationSeconds)
    .sign(getSecret(JWT_SECRET));
}

export async function signRefreshToken(payload: Omit<JwtPayload, "type">): Promise<string> {
  const expirationSeconds = parseDuration(JWT_REFRESH_EXPIRES_IN);
  return new SignJWT({ ...payload, type: "refresh" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirationSeconds)
    .sign(getSecret(JWT_REFRESH_SECRET));
}

export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(JWT_SECRET), { algorithms: ["HS256"] });
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(JWT_REFRESH_SECRET), {
      algorithms: ["HS256"],
    });
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function signPasswordResetToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email, type: "password-reset" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + 3600)
    .sign(getSecret(JWT_SECRET));
}

export async function verifyPasswordResetToken(
  token: string,
): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(JWT_SECRET), { algorithms: ["HS256"] });
    if ((payload as any).type !== "password-reset") return null;
    return { userId: (payload as any).userId, email: (payload as any).email };
  } catch {
    return null;
  }
}
