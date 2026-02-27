import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "@/lib/_core/auth";

/**
 * tRPC React client for type-safe API calls.
 *
 * IMPORTANT (tRPC v11): The `transformer` must be inside `httpBatchLink`,
 * NOT at the root createClient level. This ensures client and server
 * use the same serialization format (superjson).
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Creates the tRPC client with proper configuration.
 * Call this once in your app's root layout.
 */
export function createTRPCClient() {
  try {
    const baseUrl = getApiBaseUrl();
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: `${baseUrl}/api/trpc`,
          // tRPC v11: transformer MUST be inside httpBatchLink, not at root
          transformer: superjson,
          async headers() {
            try {
              const token = await Auth.getSessionToken();
              return token ? { Authorization: `Bearer ${token}` } : {};
            } catch (error) {
              console.warn('[TRPC] Failed to get session token for headers:', error);
              return {};
            }
          },
          // Custom fetch to include credentials for cookie-based auth
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    });
  } catch (error) {
    console.error('[TRPC] Failed to create TRPC client, using fallback:', error);
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/api/trpc',
          transformer: superjson,
        }),
      ],
    });
  }
}
