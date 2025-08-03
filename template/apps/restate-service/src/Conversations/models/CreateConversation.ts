import { z } from 'zod';

export const CreateConversationRequestSchema = z.object({
  title: z
    .string()
    .min(1, 'Title must be at least 1 character long')
    .max(50, 'Title must not exceed 50 characters'),
});

export type CreateConversationRequest = z.infer<
  typeof CreateConversationRequestSchema
>;

export const CreateConversationResponseSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID format'),
});

export type CreateConversationResponse = z.infer<
  typeof CreateConversationResponseSchema
>;
