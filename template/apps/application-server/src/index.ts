import pino from 'pino';
import { pinoHttp } from 'pino-http';
import { Dependencies, makeDependencies } from './dependencies.js';
import { readFileSync } from 'fs';
import { BaseError, Jsonable } from '@reptyl/domain-model';
import { resolvers } from './graphql/resolvers.js';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import helmet from 'helmet';
import cors from 'cors';
import { expressMiddleware } from '@as-integrations/express5';

class ServerError extends BaseError {
  constructor(
    message: string,
    options: { cause?: Error; context?: Jsonable } = {}
  ) {
    super(message, options);
    this.name = 'ServerError';
  }
}

class ServerStartupError extends ServerError {
  constructor(
    message: string,
    options: { cause?: Error; context?: Jsonable } = {}
  ) {
    super(message, options);
    this.name = 'ServerStartupError';
  }
}

class ServerShutdownError extends ServerError {
  constructor(
    message: string,
    options: { cause?: Error; context?: Jsonable } = {}
  ) {
    super(message, options);
    this.name = 'ServerShutdownError';
  }
}

class SchemaLoadError extends ServerStartupError {
  constructor(options: { cause?: Error; context?: Jsonable } = {}) {
    super('Failed to load GraphQL schema', options);
    this.name = 'SchemaLoadError';
  }
}

const isDevelopment = process.env.NODE_ENV !== 'production';
const { logger, restateClient } = await makeDependencies(isDevelopment);

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

const startServer = async () => {
  try {
    let typeDefs: string;
    try {
      typeDefs = readFileSync('./schema.graphql', 'utf8');
    } catch (error) {
      throw new SchemaLoadError({
        cause: error instanceof Error ? error : undefined,
        context: { path: './schema.graphql' },
      });
    }

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    // Create Express app
    const app = express();

    const httpServer = createServer(app);

    // Create our WebSocket server using the HTTP server we just set up.
    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/api/graphql',
    });

    // Apply request logging middleware before other middleware
    app.use(createRequestLogger(logger));

    // Save the returned server's info so we can shutdown this server later
    const serverCleanup = useServer(
      {
        schema,
        context: { restateClient, logger },
      },
      wsServer
    );

    const optionalPlugins = isDevelopment
      ? [
          // This enables Apollo Studio Sandbox in development
          ApolloServerPluginLandingPageLocalDefault({
            embed: true,
            includeCookies: true,
          }),
        ]
      : [];

    // Create Apollo Server for GraphQL
    const server = new ApolloServer<Dependencies>({
      schema,
      introspection: isDevelopment,
      plugins: [
        ...optionalPlugins,
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({ httpServer }),

        // Proper shutdown for the WebSocket server.
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
      formatError: (formattedError, error) => {
        // Log detailed error information
        logger.error(error);

        // For custom errors, we can format the response
        if (error instanceof BaseError) {
          return {
            message: formattedError.message,
            errorType: error.name,
            // We can add more information here if needed
          };
        }

        // For standard errors, return the formatted error
        return formattedError;
      },
    });

    try {
      await server.start();
    } catch (error) {
      throw new ServerStartupError('Failed to start Apollo server', {
        cause: error instanceof Error ? error : undefined,
      });
    }

    // Apply security middleware
    app.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );

    // Define CORS options
    const corsOptions = {
      origin: isDevelopment ? [] : true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };

    app.use(
      '/api/graphql',
      cors(corsOptions),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          return {
            restateClient,
            logger,
          };
        },
      })
    );

    // Start the server
    httpServer.listen(process.env.PORT, () => {
      logger.info(`🚀  Server ready at: http://localhost:${process.env.PORT}/`);
    });

    const shutdownAsync = async () => {
      try {
        logger.info('Shutting down server');
        process.exit(0);
      } catch (error) {
        logger.error(error);
        process.exit(1); // Exit with error code
      }
    };

    // Shutdown gracefully when the process terminates
    process.on('SIGINT', shutdownAsync);
    process.on('SIGTERM', shutdownAsync);

    // Handle uncaught exceptions and unhandled promise rejections
    process.on('uncaughtException', (error) => {
      logger.error(error, 'Uncaught exception:');
    });

    process.on('unhandledRejection', (reason) => {
      logger.error(reason, 'Unhandled rejection:');
    });

    return { shutdownAsync };
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

// Start the server
await startServer();
