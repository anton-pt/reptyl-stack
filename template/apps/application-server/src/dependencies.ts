import { Conversations } from '@reptyl/restate-service';
import { pino } from 'pino';
import * as clients from '@restatedev/restate-sdk-clients';

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

  const restateIngressClient = clients.connect({
    url: process.env.RESTATE_INGRESS_URL!,
  });

  const restateClient = {
    conversationsServiceClient:
      restateIngressClient.serviceClient<Conversations.ConversationsService>({
        name: 'ConversationsService',
      }),
  };

  return {
    logger,
    restateClient,
  };
};

export type Dependencies = Awaited<ReturnType<typeof makeDependencies>>;
