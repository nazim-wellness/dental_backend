import { Prisma } from '@prisma/client';

export const createLoggingExtension = (): ReturnType<
  typeof Prisma.defineExtension
> => {
  return Prisma.defineExtension({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const start = Date.now();
          try {
            const result = await query(args);
            const durationMs = Date.now() - start;

            console.log(
              `[Prisma] ${model ?? 'raw'}.${operation} in ${durationMs}ms`,
            );
            return result;
          } catch (err) {
            const durationMs = Date.now() - start;

            console.error(
              `[Prisma][Error] ${model ?? 'raw'}.${operation} in ${durationMs}ms`,
              err,
            );
            throw err;
          }
        },
      },
    },
  });
};
