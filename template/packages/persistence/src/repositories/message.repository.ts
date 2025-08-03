import { Jsonable } from '@reptyl/domain-model';
import { DataSource } from 'typeorm';

import { MessageEntity } from '../entities/index.js';
import { DatabaseRepositoryError } from '../errors.js';

export class MessageRepositoryError extends DatabaseRepositoryError {
  constructor(
    message: string,
    options: { cause?: Error; context?: Jsonable } = {}
  ) {
    super(message, options);
    this.name = 'MessageRepositoryError';
  }
}

// Define the extension methods as a type to ensure proper typing
interface MessageRepositoryExtension {}

export const makeMessageRepository = async (dataSource: DataSource) => {
  try {
    const baseRepository = dataSource.getRepository(MessageEntity);
    return baseRepository.extend<MessageRepositoryExtension>({});
  } catch (error) {
    throw new MessageRepositoryError('Failed to create message repository', {
      cause: error instanceof Error ? error : undefined,
    });
  }
};

export type MessageRepository = Awaited<
  ReturnType<typeof makeMessageRepository>
>;
