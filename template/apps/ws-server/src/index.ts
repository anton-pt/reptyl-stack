import { parseConversationUpdate } from '@reptyl/domain-model';
import { json } from 'express';
import { WebSocketExpress, Router, ExtendedWebSocket } from 'websocket-express';

import { z } from 'zod';

import { makeDependencies } from './dependencies.js';
import pino from 'pino';
import { pinoHttp } from 'pino-http';

// Initialize dependencies
const { logger } = await makeDependencies(
  process.env.NODE_ENV !== 'production'
);

// HTTP request logging middleware factory
const createRequestLogger = (logger: pino.Logger) => {
  return pinoHttp({
    logger,
    // Custom log level based on response status code
    customLogLevel: (req, res, err) => {
      if (err) {
        return 'error';
      }

      const status = res.statusCode;
      if (status >= 500) {
        return 'error';
      } else if (status >= 400) {
        return 'warn';
      }
      return 'trace'; // 2xx and 3xx responses
    },
    // Add custom request properties to the log
    customProps: (req) => ({
      userAgent: req.headers['user-agent'],
    }),
  });
};

const app = new WebSocketExpress();
const router = new Router();

app.use(json());
app.useHTTP(createRequestLogger(logger));

const conversationSockets = new Map<string, Set<ExtendedWebSocket>>();

router.ws('/conversations/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  if (
    !conversationId ||
    z.string().uuid().safeParse(conversationId).success === false
  ) {
    res.status(400).send('Valid conversation ID is required');
    return;
  }

  const ws = await res.accept();

  logger.debug(
    { conversationId },
    `WebSocket connection established for conversation`
  );
  if (!conversationSockets.has(conversationId)) {
    conversationSockets.set(conversationId, new Set([ws]));
  } else {
    conversationSockets.get(conversationId)?.add(ws);
  }

  ws.send(
    JSON.stringify(
      parseConversationUpdate({
        kind: 'connectedToConversation',
        conversationId,
      })
    )
  );

  ws.on('close', () => {
    logger.debug(
      { conversationId },
      `WebSocket connection closed for conversation`
    );
    const sockets = conversationSockets.get(conversationId);
    if (sockets) {
      sockets.delete(ws);
      if (sockets.size === 0) {
        conversationSockets.delete(conversationId);
      }
    }
  });
});

router.post('/conversations/:conversationId/updates', async (req, res) => {
  const { conversationId } = req.params;
  if (
    !conversationId ||
    z.string().uuid().safeParse(conversationId).success === false
  ) {
    res.status(400).send('Valid conversation ID is required');
    return;
  }

  let updateJSON: string;
  try {
    const update = parseConversationUpdate(req.body);
    updateJSON = JSON.stringify(update);
  } catch (error) {
    res.status(400).send('Invalid update format');
    return;
  }

  const sockets = conversationSockets.get(conversationId);
  if (sockets) {
    sockets.forEach((socket) => {
      socket.send(updateJSON);
    });
  }

  res.status(200).send('Message sent');
});

app.use(router);

const server = app.createServer();
server.listen(8082, () => {
  console.log('WebSocket server is running on ws://localhost:8082');
});
