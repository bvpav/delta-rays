import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import 'isomorphic-fetch';

const t = initTRPC.create();

export const appRouter = t.router({
  heading: t.procedure.query(() => ({ heading: 'Haqrecercnerq' })),
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
});

export type AppRouter = typeof appRouter;
