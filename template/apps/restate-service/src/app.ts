import * as restate from '@restatedev/restate-sdk';

import { makeDependencies } from './dependencies.js';

import { Conversations } from './index.js';

const dependencies = await makeDependencies(
  process.env.DATABASE_URL!,
  process.env.NODE_ENV !== 'production'
);

const { langfuse, otelSdk } = dependencies;

let restateEndpoint = restate
  .endpoint()
  .setLogger((meta, message, ...o) => {
    dependencies.logger[meta.level](
      { invocationId: meta.context?.invocationId },
      [message, ...o].join(' ')
    );
  })
  .bind(Conversations.makeConversationsService(dependencies));

restateEndpoint.listen(9080);

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await langfuse.flushAsync();
  await otelSdk.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await langfuse.flushAsync();
  await otelSdk.shutdown();
  process.exit(0);
});
