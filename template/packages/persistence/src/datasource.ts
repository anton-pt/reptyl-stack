import { Logger } from 'pino';
import { DataSource } from 'typeorm';

import { DatabaseConnectionError, DatabaseRepositoryError } from './errors.js';
import { ConversationEntity, MessageEntity } from './entities/index.js';
import {
  ConversationRepository,
  makeConversationRepository,
  makeMessageRepository,
  MessageRepository,
} from './repositories/index.js';

export interface Database {
  connection: DataSource;
  conversationRepository: ConversationRepository;
  messageRepository: MessageRepository;
}

let db: Promise<Database> | undefined;

export const connectToDB = async (
  databaseUrl: string,
  isLocalDev: boolean,
  logger: Logger
) => {
  if (db) {
    return db;
  }

  const appDataSource = new DataSource({
    url: databaseUrl,
    type: 'postgres',
    schema: 'reptyl_stack',
    entities: [ConversationEntity, MessageEntity],
    logging: isLocalDev,
    logger: 'advanced-console',
  });

  logger.info('Connecting to database');
  db = appDataSource
    .initialize()
    .then(async (connection) => {
      try {
        logger.info('Database connection established');
        logger.debug('Initializing repositories');

        const conversationRepository =
          await makeConversationRepository(connection);

        const messageRepository = await makeMessageRepository(connection);

        return {
          connection,
          conversationRepository,
          messageRepository,
        };
      } catch (error) {
        throw new DatabaseRepositoryError('Failed to initialize repository', {
          cause: error instanceof Error ? error : undefined,
        });
      }
    })
    .catch((error) => {
      throw new DatabaseConnectionError({
        cause: error instanceof Error ? error : undefined,
      });
    });

  return db;
};
