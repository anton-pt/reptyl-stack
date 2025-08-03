import z from 'zod';
import { ZodParseError } from './ZodParseError.js';

export const MessageBaseSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  createdAt: z.coerce.date(),
});

export const MessageSchema = MessageBaseSchema.brand('Message');

export type Message = z.infer<typeof MessageSchema>;

export const parseMessage = (data: z.input<typeof MessageSchema>): Message => {
  try {
    return MessageSchema.parse(data);
  } catch (error) {
    throw new ZodParseError({
      cause: error instanceof z.ZodError ? error : undefined,
      context: { data },
    });
  }
};
