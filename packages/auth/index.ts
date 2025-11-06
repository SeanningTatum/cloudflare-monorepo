import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@repo/db";
import * as schema from "@repo/db/schema";
import { admin } from "better-auth/plugins";
import { expo } from "@better-auth/expo";

export async function createAuth(
  database: ReturnType<typeof getDb>,
  options: {
    // baseUrl: string;
    productionUrl?: string;
    secret: string;
  }
) {
  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "sqlite",
      schema,
    }),
    secret: options.secret,
    trustedOrigins: ["{{projectName}}://"],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
    emailAndPassword: {
      enabled: true,
    },
    plugins: [admin(), expo()],
  });
}

export type Auth = Awaited<ReturnType<typeof createAuth>>;

// export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"]["session"];
export type User = Auth["$Infer"]["Session"]["user"];
