import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import 'isomorphic-fetch';
import mersenne from '../src/utils/mersenne';

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

      function generateHardAnswer() {
        const n = rng.range(-2, optsPerQuestion);
        return n < 0 ? null : n;
      }

      const wireframe = Array.from({ length: numQuestions }).map((_, i) => ({
        choices: Array.from({ length: optsPerQuestion }).map(() => ({})),
        correctChoiceIdx: canHaveNoAnswer
          ? generateHardAnswer()
          : rng.range(0, optsPerQuestion),
      }));

      return {
        questions: wireframe,
        canHaveNoAnswer,
      };
    }),
});

export type AppRouter = typeof appRouter;
