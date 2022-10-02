import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/react';
import { useState } from 'react';
import { Link, Route } from 'wouter';
import GamePage from './pages/game';
import HomePage from './pages/home';
import { InferProcedures, trpc } from './utils/trpc-client';

// XXX: [tRPC Docs](https://trpc.io/docs/v10/react) recommend using state for these, but I don't see the point
const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    // TODO: figure out how to use vercel deployment if running w/o `vercel dev`
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
});

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="flex h-[100vh] w-full flex-col items-center px-0 py-7 xl:justify-center">
          <Route path="/">
            <HomePage />
          </Route>

          <Route path="/easy/:id">
            {({ id }) => <GamePage difficulty="easy" id={id} />}
          </Route>
          <Route path="/medium/:id">
            {({ id }) => <GamePage difficulty="medium" id={id} />}
          </Route>
          <Route path="/hard/:id">
            {({ id }) => <GamePage difficulty="hard" id={id} />}
          </Route>
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
