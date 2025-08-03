import { connectToDB } from '@reptyl/persistence';
import { pino } from 'pino';
import { Langfuse } from 'langfuse';
import { LangfuseExporter } from 'langfuse-vercel';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { trace } from '@opentelemetry/api';

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

  const langfuse = new Langfuse({
    secretKey: process.env.LANGFUSE_SECRET_KEY!,
    publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
    baseUrl: process.env.LANGFUSE_HOST!,
  });

  const otelSdk = new NodeSDK({
    traceExporter: new LangfuseExporter({
      secretKey: process.env.LANGFUSE_SECRET_KEY!,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
      baseUrl: process.env.LANGFUSE_HOST!,
      debug: true,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  // Start OpenTelemetry before any other operations
  otelSdk.start();
  logger.info('OpenTelemetry SDK started');

  // Test that tracing is working
  const tracer = trace.getTracer('test-tracer');
  const span = tracer.startSpan('dependency-initialization');
  span.setAttributes({
    'service.name': 'restate-service',
    test: 'initialization',
  });
  span.end();
  logger.info('Test span created');

  return {
    database,
    langfuse,
    logger,
    otelSdk,
  };
};

export type Dependencies = Awaited<ReturnType<typeof makeDependencies>>;
