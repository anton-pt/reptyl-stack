import { connectToDB } from '@reptyl/persistence';
import { pino } from 'pino';

export let dependencies:
  | Awaited<ReturnType<typeof makeDependencies>>
  | undefined = undefined;

export const makeDependencies = async (
  databaseUrl: string,
  isLocalDev: boolean
) => {
  const logger = pino({
    level: isLocalDev ? 'debug' : 'info',
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
    transport: !isLocalDev
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
  });

  let database = await connectToDB(databaseUrl, isLocalDev, logger);

  return {
    database,
    logger,
  };
};

export type Dependencies = Awaited<ReturnType<typeof makeDependencies>>;
