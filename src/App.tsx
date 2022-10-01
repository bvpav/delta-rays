import { useMemo, useState } from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InferProcedures, trpc } from './utils/trpc-client';
import { httpBatchLink } from '@trpc/react';
import { Link, Route } from 'wouter';
import { nanoid } from 'nanoid';

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
  const id = useMemo(() => nanoid(10), []);

  return (
    <>
      <div>
        <h1>Select difficulty</h1>
        <Link href={`/easy/${id}`}>
          <a>
            <button>Easy</button>
          </a>
        </Link>
        <br />

        <Link href={`/medium/${id}`}>
          <a>
            <button>Medium</button>
          </a>
        </Link>
        <br />

        <Link href={`/hard/${id}`}>
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

const GamePage: React.FC<InferProcedures['game']['input']> = ({
  difficulty,
  id,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [numCorrect, setNumCorrect] = useState(0);
  const game = trpc.game.useQuery(
    { difficulty, id },
    {
      onSuccess() {
        if (currentQuestion < 0) setCurrentQuestion(0);
      },
    }
  );
  const numQuestions = game?.data?.questions?.length || 0;

  return 0 <= currentQuestion && currentQuestion < numQuestions ? (
    <>
      <h1>Question {currentQuestion + 1}</h1>
      <button onClick={() => setCurrentQuestion((q) => q + 1)}>
        next question
      </button>
    </>
  ) : numQuestions <= currentQuestion ? (
    <>
      <h1>
        Score: {numCorrect}/{numQuestions}
      </h1>
      <Link href="/">
        <a>
          <button>New Game</button>
        </a>
      </Link>
    </>
  ) : null;
};

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="App">
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
