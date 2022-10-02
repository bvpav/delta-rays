import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { InferProcedures, trpc } from '../utils/trpc-client';

const ChoiceCard: React.FC<{
  label: string;
  isCorrect?: boolean;
  onAnswer: () => void;
}> = ({ onAnswer, label, isCorrect }) => (
  <div className="flex flex-col items-center gap-3 bg-white px-6 pt-3 pb-5 text-center text-slate-900">
    <span className="text-xl font-semibold">{label}</span>
    <div className="h-64 w-96 bg-black md:h-96 md:w-96"></div>
    <button
      onClick={onAnswer}
      className="min-w-40 bg-yellow-500 px-8 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-yellow-300 hover:shadow-sm hover:shadow-yellow-200"
    >
      {isCorrect !== undefined
        ? isCorrect
          ? 'Correct'
          : 'Incorrect'
        : 'Select'}
    </button>
  </div>
);

const GameOverScreen: React.FC<{
  score: number;
  maxScore: number;
}> = ({ score, maxScore }) => {
  const tweetParams = useMemo(
    () =>
      new URLSearchParams([
        [
          'text',
          `I scored ${score}/${maxScore} on ${window.location.hostname}!${
            score !== maxScore ? '\nCan you do better?' : ''
          }\n`,
        ],
        ['url', window.location.toString()],
      ]),
    [window.location, score, maxScore]
  );

  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-6 xl:mt-0">
      <h1 className="font-alatsi text-4xl">Score</h1>
      {score === maxScore && (
        <p className="rounded-xl bg-green-600 p-1 px-3 text-xl font-extrabold uppercase text-white shadow-sm shadow-green-600">
          Max Score!!
        </p>
      )}
      <h2 className="px-8 font-alatsi text-7xl">
        <span className="text-yellow-500">{score}</span>/{maxScore}
      </h2>
      <div className="flex flex-col items-center justify-center gap-3">
        <a
          href={`https://twitter.com/intent/tweet?${tweetParams.toString()}`}
          rel="noreferrer nofollow"
          target="_blank"
          className="min-w-40 bg-cyan-500 px-8 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-cyan-300 hover:shadow-sm hover:shadow-cyan-200"
        >
          Tweet Score
        </a>
        <Link
          href="/"
          className="min-w-40 bg-yellow-500 px-8 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-yellow-300 hover:shadow-sm hover:shadow-yellow-200"
        >
          New Game
        </Link>
      </div>
    </div>
  );
};

const GameScreen: React.FC<{
  game: InferProcedures['game']['output'];
}> = ({ game }) => {
  const checkAnswer = trpc.checkAnswer.useMutation();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [numCorrect, setNumCorrect] = useState(0);
  const numQuestions = game.questions?.length || 0;
  const [currentChoice, setCurrentChoice] = useState<
    number | undefined | null
  >();
  const correctChoice = checkAnswer.data?.correctChoiceIdx;

  async function answerQuestion(choice: number | null) {
    if (currentChoice !== undefined) return;
    const { correctChoiceIdx } = await checkAnswer.mutateAsync({
      id: game.id,
      difficulty: game.difficulty,
      choiceIdx: choice,
      questionIdx: currentQuestion,
    });
    setCurrentChoice(choice);
    if (choice === correctChoiceIdx) {
      setNumCorrect((c) => c + 1);
    }
  }

  function nextQuestion() {
    setCurrentChoice(undefined);
    // unset correct choice maybe?
    setCurrentQuestion((q) => q + 1);
  }

  return 0 <= currentQuestion && currentQuestion < numQuestions ? (
    <>
      <h1 className="mb-10 text-center font-alatsi text-5xl">
        Which image was taken by the{' '}
        <span className="text-yellow-500">James Webb Space Telescope</span>?
      </h1>
      <div className="flex flex-col gap-7 xl:flex-row xl:gap-10">
        {game.questions[currentQuestion]!.map((_, i) => (
          <ChoiceCard
            key={i}
            label={`Image ${i + 1}`}
            isCorrect={
              correctChoice !== undefined && currentChoice !== undefined
                ? i === correctChoice
                : undefined
            }
            onAnswer={() => answerQuestion(i)}
          />
        ))}
      </div>
      {game.canHaveNoAnswer && (
        <button
          onClick={() => answerQuestion(null)}
          className="min-w-40  mt-8 bg-yellow-500 px-5 py-2 text-center text-2xl font-semibold uppercase text-gray-900 transition-all duration-100 hover:bg-yellow-300 hover:shadow-sm hover:shadow-yellow-200"
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
  ) : numQuestions <= currentQuestion ? (
    <GameOverScreen score={numCorrect} maxScore={numQuestions} />
  ) : null;
};

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

  return game.data ? <GameScreen game={game.data} /> : null;
};

export default GamePage;
