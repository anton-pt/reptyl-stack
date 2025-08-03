import { Jsonable } from '@reptyl/domain-model';
import { DataSource } from 'typeorm';

import { ConversationEntity } from '../entities/index.js';
import { DatabaseRepositoryError } from '../errors.js';

export class ConversationRepositoryError extends DatabaseRepositoryError {
  constructor(
    message: string,
    options: { cause?: Error; context?: Jsonable } = {}
  ) {
    super(message, options);
    this.name = 'ConversationRepositoryError';
  }
}

// Define the extension methods as a type to ensure proper typing
interface ConversationRepositoryExtension {}

export const makeConversationRepository = async (dataSource: DataSource) => {
  try {
    const baseRepository = dataSource.getRepository(ConversationEntity);
    return baseRepository.extend<ConversationRepositoryExtension>({});
  } catch (error) {
    throw new ConversationRepositoryError(
      'Failed to create conversation repository',
      {
        cause: error instanceof Error ? error : undefined,
      }
    );
  }
};

export type ConversationRepository = Awaited<
  ReturnType<typeof makeConversationRepository>
>;
