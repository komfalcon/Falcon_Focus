import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../_core/trpc";
import {
  signUp,
  signIn,
  googleSignIn,
  refreshTokens,
  forgotPassword,
  resetPassword,
} from "./auth.service";
import { exchangeGoogleCode, getGoogleUserInfo } from "./google.strategy";

export const authRouter = router({
  signup: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await signUp(input.name, input.email, input.password);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Sign up failed",
        });
      }
    }),

  signin: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await signIn(input.email, input.password);
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error instanceof Error ? error.message : "Sign in failed",
        });
      }
    }),

  googleAuth: publicProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const accessToken = await exchangeGoogleCode(input.code);
        const googleUser = await getGoogleUserInfo(accessToken);
        return await googleSignIn(googleUser.id, googleUser.email, googleUser.name, googleUser.picture);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Google auth failed",
        });
      }
    }),

  refresh: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return await refreshTokens(input.refreshToken);
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error instanceof Error ? error.message : "Token refresh failed",
        });
      }
    }),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email("Invalid email address") }))
    .mutation(async ({ input }) => {
      await forgotPassword(input.email);
      return { success: true, message: "If that email exists, a reset link has been sent." };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await resetPassword(input.token, input.password);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Password reset failed",
        });
      }
    }),
});
