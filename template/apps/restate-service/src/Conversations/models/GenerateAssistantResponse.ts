import { z } from 'zod';

export const GenerateAssistantResponseRequestSchema = z.object({
  userMessageId: z.string().uuid('Invalid user message ID format'),
  conversationId: z.string().uuid('Invalid conversation ID format'),
  messages: z.array(
    z.object({
      content: z.string().min(1, 'Message cannot be empty'),
      role: z.enum(['user', 'assistant', 'system']),
    })
  ),
});

export type GenerateAssistantResponseRequest = z.infer<
  typeof GenerateAssistantResponseRequestSchema
>;

export const GenerateAssistantResponseResponseSchema = z.object({
  response: z.string().min(1, 'Response cannot be empty'),
});

export type GenerateAssistantResponseResponse = z.infer<
  typeof GenerateAssistantResponseResponseSchema
>;
