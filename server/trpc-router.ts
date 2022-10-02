import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import 'isomorphic-fetch';
import mersenne, { RNG } from '../src/utils/mersenne';
import rushedData from '../src/utils/rushed-data';

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
          q.choices.map((rushedIdx) => {
            return rushedData[rushedIdx]!.img;
          })
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
        answers: question.choices.map(
          (rushedIdx) => rushedData[rushedIdx]!.telescope
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

  const seen = new Set<number>();

  const wireframe = Array.from({ length: numQuestions }).map((_, i) => {
    const correct = canHaveNoAnswer
      ? generateHardAnswer()
      : rng.range(0, optsPerQuestion);

    return {
      choices: Array.from({ length: optsPerQuestion }).map((_, i) => {
        const needJwst = i === correct;
        let n: number;
        do {
          n = rng.range(0, rushedData.length);
        } while (
          seen.has(n) ||
          (rushedData[n]!.telescope !== 'James Webb' && needJwst) ||
          (rushedData[n]!.telescope === 'James Webb' && !needJwst)
        );
        seen.add(n);
        return n;
      }),
      correctChoiceIdx: correct,
    };
  });
  return wireframe;
}
