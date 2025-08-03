import { pino } from 'pino';

export let dependencies:
  | Awaited<ReturnType<typeof makeDependencies>>
  | undefined = undefined;

export const makeDependencies = async (isLocalDev: boolean) => {
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

  return {
    logger,
  };
};

export type Dependencies = Awaited<ReturnType<typeof makeDependencies>>;
