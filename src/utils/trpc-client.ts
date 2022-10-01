import { createTRPCReact } from '@trpc/react';
import type { AppRouter } from '../../server/trpc-router';

export const trpc = createTRPCReact<AppRouter>();
