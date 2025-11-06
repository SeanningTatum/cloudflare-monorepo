'use client';

import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState, type PropsWithChildren } from 'react';
import superjson from 'superjson';

import type { AppRouter } from '@jurni/trpc/routers/index.js';
import { makeQueryClient } from '@jurni/trpc/query-client';
import { authClient } from './auth';

export const api = createTRPCReact<AppRouter>();

let clientQueryClientSingleton: QueryClient;

function getQueryClient() {
  return (clientQueryClientSingleton ??= makeQueryClient());
}

function getUrl() {

  return `http://localhost:3000/api/trpc`;
}

export function TRPCProvider(props: PropsWithChildren) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
          colorMode: 'ansi',
        }),
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
          headers() {
            const headers = new Map<string, string>();
            headers.set('x-trpc-source', 'expo-react');

            const cookies = authClient.getCookie();
            if (cookies) {
              headers.set('Cookie', cookies);
            }
            return Object.fromEntries(headers);
          },
        }),
      ],
    }),
  );
  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </api.Provider>
  );
}