import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const appRouter = t.router({
  test: t.procedure.query(() => ({ msg: 'Haqrecercnerq' })),
});

export type AppRouter = typeof appRouter;
