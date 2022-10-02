import { useMemo, useState } from 'react';
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

function HomePage() {
  const id = useMemo(() => nanoid(10), []);

  return (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="yellow-400 mb-12 font-alatsi text-7xl font-bold tracking-wide">
          Select difficulty
        </h1>
        <Link
          href={`/easy/${id}`}
          className="w-40 bg-yellow-500 px-8 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-yellow-300 hover:shadow-sm hover:shadow-yellow-200"
        >
          Easy
        </Link>
        <br />

        <Link
          href={`/medium/${id}`}
          className="w-40 bg-yellow-500 px-8 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-yellow-300 hover:shadow-sm hover:shadow-yellow-200"
        >
          Medium
        </Link>
        <br />

        <Link
          href={`/hard/${id}`}
          className="w-40 bg-yellow-500 px-8 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-yellow-300 hover:shadow-sm hover:shadow-yellow-200"
        >
          Hard
        </Link>
        <br />
      </div>
      <br />
      <br />
    </>
  );
}

const GamePage: React.FC<InferProcedures['game']['input']> = ({
  difficulty,
  id,
}) => {
  const game = trpc.game.useQuery(
    { difficulty, id },
    {
      staleTime: Infinity,
    }
  );

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [numCorrect, setNumCorrect] = useState(0);
  const numQuestions = game?.data?.questions?.length || 0;
  const [currentChoice, setCurrentChoice] = useState<
    number | undefined | null
  >();
  const correctChoice = game.data?.questions[currentQuestion]?.correctChoiceIdx;

  function answerQuestion(choice: number | null) {
    if (currentChoice !== undefined) return;
    setCurrentChoice(choice);
    // setCorrectChoice somehow here
    if (choice === correctChoice) {
      setNumCorrect((c) => c + 1);
    }
  }

  function nextQuestion() {
    setCurrentChoice(undefined);
    // unset correct choice maybe?
    setCurrentQuestion((q) => q + 1);
  }

  return game.data && 0 <= currentQuestion && currentQuestion < numQuestions ? (
    <>
      <h1 className="mb-10 text-center font-alatsi text-5xl">
        Which image was taken by the{' '}
        <span className="text-yellow-500">James Webb Space Telescope</span>?
      </h1>
      <div className="flex flex-col gap-7 xl:flex-row xl:gap-10">
        {game.data.questions[currentQuestion]!.choices.map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 bg-white px-6 pt-3 pb-5 text-center text-slate-900"
          >
            <span className="text-xl font-semibold">Image {i + 1} </span>
            <div className="h-64 w-96 bg-black md:h-96 md:w-96"></div>
            <button
              onClick={() => answerQuestion(i)}
              className="min-w-40 bg-yellow-500 px-8 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-yellow-300 hover:shadow-sm hover:shadow-yellow-200"
            >
              {i === correctChoice! ? 'Correct' : 'Incorrect'}
            </button>
          </div>
        ))}
      </div>
      {game.data.canHaveNoAnswer && (
        <button
          onClick={() => answerQuestion(null)}
          className="min-w-40 mt-8 bg-yellow-500 px-5 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-yellow-300 hover:shadow-sm hover:shadow-yellow-200"
        >
          None of the above
        </button>
      )}
      {currentChoice !== undefined && correctChoice !== undefined && (
        <div className="my-10 w-1/2 bg-green-200 p-5 text-center font-alatsi text-xl font-bold uppercase">
          {currentChoice === correctChoice ? (
            <p className="text-green-900">Correct!</p>
          ) : (
            <p className="text-red-900">Incorrect!</p>
          )}
        </div>
      )}
      {currentChoice !== undefined && (
        <button
          onClick={nextQuestion}
          className="min-w-40 bg-yellow-500 px-8 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-yellow-300 hover:shadow-sm hover:shadow-yellow-200"
        >
          {currentQuestion < numQuestions - 1 ? 'Next Question' : 'Show Score'}
        </button>
      )}
    </>
  ) : game.data && numQuestions <= currentQuestion ? (
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
        <div className="my-5 flex h-[100vh] w-full flex-col items-center p-0 xl:justify-center">
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
