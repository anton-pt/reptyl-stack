import * as restate from '@restatedev/restate-sdk';

import { makeDependencies } from './dependencies.js';

import { Conversations } from './index.js';

const dependencies = await makeDependencies(
  process.env.DATABASE_URL!,
  process.env.NODE_ENV !== 'production'
);

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
