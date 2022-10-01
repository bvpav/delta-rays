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
      <div className="flex flex-col items-center">
        <h1 className="text-5xl font-bold mb-7">Select difficulty</h1>
        <Link
          href={`/easy/${id}`}
          className="bg-yellow-500 text-gray-900 hover:bg-yellow-300 px-8 py-2 text-2xl font-semibold"
        >
          Easy
        </Link>
        <br />

        <Link
          href={`/medium/${id}`}
          className="bg-yellow-500 text-gray-900 hover:bg-yellow-300 px-8 py-2 text-2xl font-semibold"
        >
          Medium
        </Link>
        <br />

        <Link
          href={`/hard/${id}`}
          className="bg-yellow-500 text-gray-900 hover:bg-yellow-300 px-8 py-2 text-2xl font-semibold"
        >
          Hard
        </Link>
        <br />
      </div>
      <br />
      <br />

      {/* <p className="read-the-docs">pics lmao</p>
      {Array.from({ length: pages }).map((_, page) => (
        <Images page={page} key={page} />
      ))}
      <br />
      <button onClick={() => setPages((p) => p + 1)}>show more</button> */}
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
      <h1>Question {currentQuestion + 1}</h1>
      <div>
        {game.data.questions[currentQuestion]!.choices.map((_, i) => (
          <div key={i}>
            <span>Option {i + 1} </span>
            <button onClick={() => answerQuestion(i)}>
              {i === correctChoice! ? 'Correct' : 'Incorrect'}
            </button>
          </div>
        ))}
      </div>
      {game.data.canHaveNoAnswer && (
        <button onClick={() => answerQuestion(null)}>None of the above</button>
      )}
      {currentChoice !== undefined &&
        correctChoice !== undefined &&
        (currentChoice === correctChoice ? <p>Correct</p> : <p>Incorrect</p>)}
      {currentChoice !== undefined && (
        <button onClick={nextQuestion}>
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
        <div className="flex m-0 p-0 flex-col w-full h-[100vh] justify-center items-center">
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
