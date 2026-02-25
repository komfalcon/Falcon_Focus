import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";
import { UserModel } from "../models/user.model";
import { connectMongoDB } from "./auth.service";

export async function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.slice(7).trim();
  const payload = await verifyAccessToken(token);

  if (payload) {
    try {
      await connectMongoDB();
      const user = await UserModel.findById(payload.userId);
      if (user) {
        (req as any).mongoUser = user;
      }
    } catch (error) {
      console.error("[JWT Middleware] Failed to load user:", error);
    }
  }

  next();
}
