import { z } from 'zod';

export const GetMessagesForConversationRequestSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID format'),
});

export type GetMessagesForConversationRequest = z.infer<
  typeof GetMessagesForConversationRequestSchema
>;

export const GetMessagesForConversationResponseSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string().uuid('Invalid message ID format'),
      content: z.string(),
      role: z.enum(['user', 'assistant', 'system']),
      createdAt: z.string().datetime('Invalid date format'),
      updatedAt: z.string().datetime('Invalid date format'),
    })
  ),
});

export type GetMessagesForConversationResponse = z.infer<
  typeof GetMessagesForConversationResponseSchema
>;
