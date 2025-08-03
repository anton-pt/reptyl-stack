import z from 'zod';
import { ZodParseError } from './ZodParseError.js';

export const ConnectedToConversationBaseSchema = z.object({
  conversationId: z.string().uuid(),
});

export const ConnectedToConversationSchema =
  ConnectedToConversationBaseSchema.brand('ConnectedToConversation');

export type ConnectedToConversation = z.infer<
  typeof ConnectedToConversationSchema
>;

export const parseConnectedToConversation = (
  data: z.input<typeof ConnectedToConversationSchema>
): ConnectedToConversation => {
  try {
    return ConnectedToConversationSchema.parse(data);
  } catch (error) {
    throw new ZodParseError({
      cause: error instanceof z.ZodError ? error : undefined,
      context: { data },
    });
  }
};
