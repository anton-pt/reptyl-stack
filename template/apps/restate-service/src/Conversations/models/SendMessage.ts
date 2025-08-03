import { z } from 'zod';

export const SendMessageRequestSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID format'),
  message: z.string().min(1, 'Message cannot be empty'),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

export const SendMessageResponseSchema = z.object({
  messageId: z.string().uuid('Invalid message ID format'),
});

export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;
