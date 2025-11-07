import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@expo-with-mobile/db";
import * as schema from "@expo-with-mobile/db/schema";
import { admin } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import type { D1Database } from "@cloudflare/workers-types";

export const authConfig = {
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin(), expo()],
} satisfies BetterAuthOptions;

export async function createAuth(database: D1Database, secret: string) {
  const db = getDb(database);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    secret,
    trustedOrigins: ["expo-with-mobile://"],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
    ...authConfig,
  });
}

export type Auth = Awaited<ReturnType<typeof createAuth>>;

// export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"]["session"];
export type User = Auth["$Infer"]["Session"]["user"];
