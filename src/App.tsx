import { useState } from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from './utils/trpc-client';
import { httpBatchLink } from '@trpc/react';
import { Link, Route } from 'wouter';

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
  const images = trpc.images.useQuery(
    { page },
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  return (
    <>
      {(images.data || []).map((src) => (
        <img src={src} alt="image of space" key={src} />
      ))}
    </>
  );
}

function HomePage() {
  const [pages, setPages] = useState(1);

  return (
    <>
      <Heading />
      <div>
        <h1>Select difficulty</h1>
        <Link href="/easy/asd">
          <a>
            <button>Easy</button>
          </a>
        </Link>
        <br />

        <Link href="/medium/asd">
          <a>
            <button>Medium</button>
          </a>
        </Link>
        <br />

        <Link href="/hard/asd">
          <a>
            <button>Hard</button>
          </a>
        </Link>
        <br />
      </div>
      <br />
      <br />

      <p className="read-the-docs">pics lmao</p>
      {Array.from({ length: pages }).map((_, page) => (
        <Images page={page} key={page} />
      ))}
      <br />
      <button onClick={() => setPages((p) => p + 1)}>show more</button>
    </>
  );
}

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <Route path="/">
            <HomePage />
          </Route>

          <Route path="/easy/:id">
            {({ id }: { id: string }) => <p>Easy {id}</p>}
          </Route>
          <Route path="/medium/:id">
            {({ id }: { id: string }) => <p>Medium {id}</p>}
          </Route>
          <Route path="/hard/:id">
            {({ id }: { id: string }) => <p>Hard {id}</p>}
          </Route>
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
