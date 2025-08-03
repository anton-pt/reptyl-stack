import { BaseError, Jsonable } from './BaseError.js';

export class ZodParseError extends BaseError {
  constructor(options: { cause?: Error; context?: Jsonable } = {}) {
    super('Zod parse error', options);
    this.name = 'ZodParseError';
  }
}
