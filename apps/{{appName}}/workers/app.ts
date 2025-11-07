import { createRequestHandler } from "react-router";
import { AppRouter, appRouter } from "@repo/trpc/routers";
import { createAuth, type Auth, type User } from "@repo/auth";
import { createCallerFactory, createTRPCContext } from "@repo/trpc/lib";
import { getDb } from "@repo/db";

const createCaller = createCallerFactory(appRouter);

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    trpc: ReturnType<typeof createCaller>;
    auth: Auth;
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export { ExampleWorkflow } from "../workflows/example";

export default {
  async fetch(request, env, ctx) {
    const database = getDb(env.DATABASE);

    const auth = await createAuth(env.DATABASE, {
      secret: env.BETTER_AUTH_SECRET,
    });

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const trpcContext = await createTRPCContext({
      headers: request.headers,
      database,
      auth: session
        ? {
            session: session.session,
            user: session.user,
          }
        : null,
      authApi: auth.api,
      workflows: {
        ExampleWorkflow: env.EXAMPLE_WORKFLOW,
      },
    });

    const trpcCaller = createCaller(trpcContext);

    return requestHandler(request, {
      cloudflare: { env, ctx },
      trpc: trpcCaller,
      auth,
    });
  },
} satisfies ExportedHandler<Env>;
