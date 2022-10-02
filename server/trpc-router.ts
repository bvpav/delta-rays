import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import 'isomorphic-fetch';
import mersenne, { RNG } from '../src/utils/mersenne';

const t = initTRPC.create();

export const appRouter = t.router({
  game: t.procedure
    .input(
      z.object({
        id: z.string(),
        difficulty: z.union([
          z.literal('easy'),
          z.literal('medium'),
          z.literal('hard'),
        ]),
      })
    )
    .query(async ({ input }) => {
      const numQuestions = input.difficulty === 'easy' ? 5 : 10;
      const optsPerQuestion = input.difficulty === 'easy' ? 2 : 3;
      const canHaveNoAnswer = input.difficulty === 'hard';
      const rng = mersenne(input.difficulty + input.id);

      const wireframe = genWireframe({
        rng,
        optsPerQuestion,
        numQuestions,
        canHaveNoAnswer,
      });

      return {
        questions: wireframe.map((q) =>
          q.choices.map(({}, i) => i === q.correctChoiceIdx)
        ),
        canHaveNoAnswer,

        // XXX: unnecessary pass-through
        difficulty: input.difficulty,
        id: input.id,
      };
    }),

  checkAnswer: t.procedure
    .input(
      z.object({
        id: z.string(),
        difficulty: z.union([
          z.literal('easy'),
          z.literal('medium'),
          z.literal('hard'),
        ]),
        questionIdx: z.number().min(0),
        choiceIdx: z.number().min(0).nullable(),
      })
    )
    .mutation(({ input }) => {
      const numQuestions = input.difficulty === 'easy' ? 5 : 10;
      const optsPerQuestion = input.difficulty === 'easy' ? 2 : 3;
      const canHaveNoAnswer = input.difficulty === 'hard';
      const rng = mersenne(input.difficulty + input.id);
      const wireframe = genWireframe({
        rng,
        optsPerQuestion,
        numQuestions,
        canHaveNoAnswer,
      });

      const question = wireframe[input.questionIdx];
      if (!question)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid question index ${input.questionIdx}, must be at most ${wireframe.length}`,
        });

      return {
        isCorrect: question.correctChoiceIdx === input.choiceIdx,
        correctChoiceIdx: question.correctChoiceIdx,
        answers: question.choices.map((_, i) =>
          i === question.correctChoiceIdx ? 'Correct,' : 'Incorrect,,,'
        ),
      };
    }),
});

export type AppRouter = typeof appRouter;

function genWireframe({
  rng,
  optsPerQuestion,
  numQuestions,
  canHaveNoAnswer,
}: {
  rng: RNG;
  optsPerQuestion: number;
  numQuestions: number;
  canHaveNoAnswer: boolean;
}) {
  function generateHardAnswer() {
    const n = rng.range(-2, optsPerQuestion);
    return n < 0 ? null : n;
  }

  const wireframe = Array.from({ length: numQuestions }).map((_, i) => ({
    choices: Array.from({ length: optsPerQuestion }).map(() => ({
      idx: 0,
    })),
    correctChoiceIdx: canHaveNoAnswer
      ? generateHardAnswer()
      : rng.range(0, optsPerQuestion),
  }));
  return wireframe;
}
