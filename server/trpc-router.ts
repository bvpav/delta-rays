import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import 'isomorphic-fetch';

const t = initTRPC.create();

export const appRouter = t.router({
  images: t.procedure
    .input(
      z.object({
        page: z.number(),
      })
    )
    .query(async ({ input }) => {
      const url = new URL('https://api.jwstapi.com/all/type/jpg');
      url.searchParams.set('page', (input.page + 1).toString());
      url.searchParams.set('perPage', '5');
      const res = await fetch(url.toString(), {
        headers: {
          'X-API-KEY': process.env.JWSTAPI_TOKEN!,
        },
      });
      const obj = (await res.json()) as {
        body: { location: string; thumbnail: string }[];
      };
      return obj.body.map((o) => o.location);
    }),
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
      // const seed = input.difficulty + input.id;

      const wireframe = Array.from({ length: numQuestions }).map((_, i) => ({
        choices: Array.from({ length: optsPerQuestion }).map(() => ({})),
        correctChoiceIdx: canHaveNoAnswer
          ? Math.floor(Math.random() * (optsPerQuestion + 2)) - 2
          : Math.floor(Math.random() * optsPerQuestion),
      }));

      return {
        questions: wireframe,
        canHaveNoAnswer,
      };
    }),
});

export type AppRouter = typeof appRouter;
