import z from 'zod';
import { ZodParseError } from './ZodParseError.js';

export const ResponsePartBaseSchema = z.object({
  userMessageId: z.string().uuid(),
  role: z.literal('assistant'),
  responsePart: z.string(),
});

export const ResponsePartSchema = ResponsePartBaseSchema.brand('ResponsePart');

export type ResponsePart = z.infer<typeof ResponsePartSchema>;

export const parseResponsePart = (
  data: z.input<typeof ResponsePartSchema>
): ResponsePart => {
  try {
    return ResponsePartSchema.parse(data);
  } catch (error) {
    throw new ZodParseError({
      cause: error instanceof z.ZodError ? error : undefined,
      context: { data },
    });
  }
};
