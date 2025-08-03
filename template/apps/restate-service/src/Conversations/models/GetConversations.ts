import { z } from 'zod';

export const GetConversationsRequestSchema = z.void();

export type GetConversationsRequest = z.infer<
  typeof GetConversationsRequestSchema
>;

export const GetConversationsResponseSchema = z.object({
  conversations: z.array(
    z.object({
      id: z.string().uuid('Invalid conversation ID format'),
      title: z.string().optional(),
      createdAt: z.string().datetime('Invalid date format'),
      updatedAt: z.string().datetime('Invalid date format'),
    })
  ),
});

export type GetConversationsResponse = z.infer<
  typeof GetConversationsResponseSchema
>;
