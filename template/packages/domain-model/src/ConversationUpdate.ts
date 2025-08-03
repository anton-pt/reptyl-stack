import z from 'zod';
import { ZodParseError } from './ZodParseError.js';
import { MessageBaseSchema } from './Message.js';
import { ResponsePartBaseSchema } from './ResponsePart.js';
import { ConnectedToConversationBaseSchema } from './ConnectedToConversation.js';

export const ConversationUpdateBaseSchema = z.discriminatedUnion('kind', [
  ConnectedToConversationBaseSchema.extend({
    kind: z.literal('connectedToConversation'),
  }),
  MessageBaseSchema.extend({
    kind: z.literal('message'),
  }),
  ResponsePartBaseSchema.extend({
    kind: z.literal('responsePart'),
  }),
]);

export const ConversationUpdateSchema =
  ConversationUpdateBaseSchema.brand('ConversationUpdate');

export type ConversationUpdate = z.infer<typeof ConversationUpdateSchema>;

export const parseConversationUpdate = (
  data: z.input<typeof ConversationUpdateSchema>
): ConversationUpdate => {
  try {
    return ConversationUpdateSchema.parse(data);
  } catch (error) {
    throw new ZodParseError({
      cause: error instanceof z.ZodError ? error : undefined,
      context: { data },
    });
  }
};
