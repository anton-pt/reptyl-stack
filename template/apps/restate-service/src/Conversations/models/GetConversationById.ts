import { z } from 'zod';

export const GetConversationByIdRequestSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID format'),
});

export type GetConversationByIdRequest = z.infer<
  typeof GetConversationByIdRequestSchema
>;

export const GetConversationByIdResponseSchema = z.object({
  conversation: z.object({
    id: z.string().uuid('Invalid conversation ID format'),
    title: z.string().optional(),
    createdAt: z.string().datetime('Invalid date format'),
    updatedAt: z.string().datetime('Invalid date format'),
  }),
});

export type GetConversationByIdResponse = z.infer<
  typeof GetConversationByIdResponseSchema
>;
