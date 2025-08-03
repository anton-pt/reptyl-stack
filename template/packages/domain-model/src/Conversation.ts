import z from 'zod';
import { MessageBaseSchema } from './Message.js';
import { ZodParseError } from './ZodParseError.js';

export const ConversationBaseSchema = z.object({
  id: z.string().uuid(),
  messages: z.array(MessageBaseSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ConversationSchema = ConversationBaseSchema.brand('Conversation');

export type Conversation = z.infer<typeof ConversationSchema>;

export const parseConversation = (
  data: z.input<typeof ConversationSchema>
): Conversation => {
  try {
    return ConversationSchema.parse(data);
  } catch (error) {
    throw new ZodParseError({
      cause: error instanceof z.ZodError ? error : undefined,
      context: { data },
    });
  }
};
