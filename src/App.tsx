import { useState } from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from './utils/trpc-client';
import { httpBatchLink } from '@trpc/react';

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

function Heading() {
  const message = trpc.heading.useQuery();
  return <h1>{message.data?.heading || 'Loading...'}</h1>;
}

function Images({ page }: { page: number }) {
  const images = trpc.images.useQuery({ page });

  return (
    <>
      {(images.data || []).map((src) => (
        <img src={src} alt="image of space" key={src} />
      ))}
    </>
  );
}

function App() {
  const [pages, setPages] = useState(1);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <Heading />

          <p className="read-the-docs">pics lmao</p>

          {Array.from({ length: pages }).map((_, page) => (
            <Images page={page} />
          ))}
          <button onClick={() => setPages((p) => p + 1)}>show more</button>
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
