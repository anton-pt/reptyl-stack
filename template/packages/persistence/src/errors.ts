import { BaseError, Jsonable } from '@reptyl/domain-model';

// Custom database error classes
export class DatabaseError extends BaseError {
  constructor(
    message: string,
    options: { cause?: Error; context?: Jsonable } = {}
  ) {
    super(message, options);
    this.name = 'DatabaseError';
  }
}

export class DatabaseConnectionError extends DatabaseError {
  constructor(options: { cause?: Error; context?: Jsonable } = {}) {
    super('Failed to connect to database', options);
    this.name = 'DatabaseConnectionError';
  }
}

export class DatabaseRepositoryError extends DatabaseError {
  constructor(
    message: string,
    options: { cause?: Error; context?: Jsonable } = {}
  ) {
    super(message, options);
    this.name = 'DatabaseRepositoryError';
  }
}
