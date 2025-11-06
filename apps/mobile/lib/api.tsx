import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";

import { makeQueryClient, type AppRouter } from "@jurni/trpc";

// import { authClient } from "./auth";
import { getBaseUrl } from "./base-url";

export const queryClient = makeQueryClient()
/**
 * A set of typesafe hooks for consuming your API.
 */
export const trpcOptionsProxy = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
        colorMode: "ansi",
      }),
      httpBatchLink({
        transformer: superjson,
        url: `${getBaseUrl()}/api/trpc`,
        headers() {
          const headers = new Map<string, string>();
          headers.set("x-trpc-source", "expo-react");

          // const cookies = authClient.getCookie();
          // if (cookies) {
          //   headers.set("Cookie", cookies);
          // }
          return headers;
        },
      }),
    ],
  }),
  queryClient,
});

// export type { RouterInputs, RouterOutputs } from "@jurni/trpc";
