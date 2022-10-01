import { createTRPCReact } from '@trpc/react';
import { GetInferenceHelpers } from '@trpc/server';
import type { AppRouter } from '../../server/trpc-router';

export const trpc = createTRPCReact<AppRouter>();

export type InferProcedures = GetInferenceHelpers<AppRouter>;
