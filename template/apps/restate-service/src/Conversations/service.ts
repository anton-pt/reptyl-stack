import * as restate from '@restatedev/restate-sdk';
import { serde } from '@restatedev/restate-sdk-zod';
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

import { Dependencies } from '../dependencies.js';
import {
  CreateConversationRequestSchema,
  CreateConversationResponse,
  CreateConversationResponseSchema,
} from './models/CreateConversation.js';
import {
  GetConversationsRequestSchema,
  GetConversationsResponse,
  GetConversationsResponseSchema,
} from './models/GetConversations.js';
import {
  GetConversationByIdRequestSchema,
  GetConversationByIdResponse,
  GetConversationByIdResponseSchema,
} from './models/GetConversationById.js';
import {
  SendMessageRequestSchema,
  SendMessageResponse,
  SendMessageResponseSchema,
} from './models/SendMessage.js';
import axios from 'axios';
import { parseConversationUpdate } from '@reptyl/domain-model';
import {
  GenerateAssistantResponseRequestSchema,
  GenerateAssistantResponseResponse,
  GenerateAssistantResponseResponseSchema,
} from './models/GenerateAssistantResponse.js';
import {
  GetMessagesForConversationRequestSchema,
  GetMessagesForConversationResponse,
  GetMessagesForConversationResponseSchema,
} from './models/GetMessagesForConversation.js';

export const makeConversationsService = ({ database }: Dependencies) => {
  return restate.service({
    name: 'ConversationsService',
    handlers: {
      getConversations: restate.handlers.handler(
        {
          input: serde.zod(GetConversationsRequestSchema),
          output: serde.zod(GetConversationsResponseSchema),
        },
        async (ctx: restate.Context): Promise<GetConversationsResponse> => {
          const conversations = await ctx.run(() =>
            database.conversationRepository.find()
          );

          return {
            conversations: conversations.map((conversation) => ({
              id: conversation.id,
              title: conversation.title,
              createdAt: conversation.createdAt.toString(),
              updatedAt: conversation.updatedAt.toString(),
            })),
          };
        }
      ),
      getConversationById: restate.handlers.handler(
        {
          input: serde.zod(GetConversationByIdRequestSchema),
          output: serde.zod(GetConversationByIdResponseSchema),
        },
        async (
          ctx: restate.Context,
          { conversationId }
        ): Promise<GetConversationByIdResponse> => {
          const conversation = await ctx.run(() =>
            database.conversationRepository.findOne({
              where: { id: conversationId },
            })
          );

          if (!conversation) {
            throw new restate.TerminalError('Conversation not found');
          }

          return {
            conversation: {
              id: conversation.id,
              title: conversation.title,
              createdAt: conversation.createdAt.toString(),
              updatedAt: conversation.updatedAt.toString(),
            },
          };
        }
      ),
      createConversation: restate.handlers.handler(
        {
          input: serde.zod(CreateConversationRequestSchema),
          output: serde.zod(CreateConversationResponseSchema),
        },
        async (
          ctx: restate.Context,
          { title }
        ): Promise<CreateConversationResponse> => {
          const conversation = await ctx.run(async () => {
            const conversation = database.conversationRepository.create({
              title,
            });

            return await database.conversationRepository.save(conversation);
          });

          return {
            conversationId: conversation.id,
          };
        }
      ),
      getMessagesForConversation: restate.handlers.handler(
        {
          input: serde.zod(GetMessagesForConversationRequestSchema),
          output: serde.zod(GetMessagesForConversationResponseSchema),
        },
        async (
          ctx: restate.Context,
          { conversationId }
        ): Promise<GetMessagesForConversationResponse> => {
          const messages = await ctx.run(() =>
            database.messageRepository.find({
              where: { conversationId },
              order: { createdAt: 'ASC' },
            })
          );

          return {
            messages: messages.map((message) => ({
              id: message.id,
              content: message.content,
              role: message.role,
              createdAt: message.createdAt.toString(),
              updatedAt: message.updatedAt.toString(),
            })),
          };
        }
      ),
      sendMessage: restate.handlers.handler(
        {
          input: serde.zod(SendMessageRequestSchema),
          output: serde.zod(SendMessageResponseSchema),
        },
        async (
          ctx: restate.Context,
          { conversationId, message }
        ): Promise<SendMessageResponse> => {
          const conversation = await ctx.run(() =>
            database.conversationRepository.findOne({
              where: { id: conversationId },
              order: {
                messages: {
                  orderNumber: 'ASC',
                },
              },
              relations: ['messages'],
            })
          );

          if (!conversation || conversation.messages === undefined) {
            throw new restate.TerminalError('Conversation not found');
          }

          if (
            conversation.messages.length > 0 &&
            conversation.messages[conversation.messages.length - 1].role ===
              'user'
          ) {
            throw new restate.TerminalError(
              'Cannot send a message while waiting for a response from the assistant'
            );
          }

          const newMessage = await ctx.run(async () => {
            const newMessage = database.messageRepository.create({
              content: message,
              conversationId: conversation.id,
              role: 'user',
              orderNumber: conversation.messages!.length + 1,
            });

            return await database.messageRepository.save(newMessage);
          });

          await ctx.run(() => {
            axios.post(
              `http://localhost:8082/conversations/${conversationId}/updates`,
              parseConversationUpdate({
                kind: 'message',
                id: newMessage.id,
                content: newMessage.content,
                role: newMessage.role,
                createdAt: newMessage.createdAt,
              })
            );
          });

          ctx
            .serviceSendClient<ConversationsService>({
              name: 'ConversationsService',
            })
            .getAssistantResponse({
              userMessageId: newMessage.id,
              conversationId: conversation.id,
              messages: [
                ...conversation.messages.map((msg) => ({
                  content: msg.content,
                  role: msg.role,
                })),
                { content: newMessage.content, role: 'user' },
              ],
            });

          return { messageId: newMessage.id };
        }
      ),
      getAssistantResponse: restate.handlers.handler(
        {
          input: serde.zod(GenerateAssistantResponseRequestSchema),
          output: serde.zod(GenerateAssistantResponseResponseSchema),
        },
        async (
          ctx: restate.Context,
          { userMessageId, conversationId, messages }
        ): Promise<GenerateAssistantResponseResponse> => {
          const response = await ctx.run(async () => {
            const result = streamText({
              model: anthropic('claude-3-7-sonnet-20250219'),
              messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              system: 'You are a helpful assistant.',
              temperature: 0.7,
              maxTokens: 1000,
            });

            const messageId = ctx.rand.uuidv4();
            let responseText = '';
            for await (const textPart of result.textStream) {
              responseText += textPart;
              axios.post(
                `http://localhost:8082/conversations/${conversationId}/updates`,
                parseConversationUpdate({
                  kind: 'responsePart',
                  userMessageId,
                  role: 'assistant',
                  responsePart: textPart,
                })
              );
            }

            return { id: messageId, content: responseText };
          });

          const newMessage = await ctx.run(async () => {
            const newMessage = database.messageRepository.create({
              id: response.id,
              conversationId: conversationId,
              role: 'assistant',
              orderNumber: messages.length + 1,
              content: response.content,
            });

            return await database.messageRepository.save(newMessage);
          });

          await ctx.run(() => {
            axios.post(
              `http://localhost:8082/conversations/${conversationId}/updates`,
              parseConversationUpdate({
                kind: 'message',
                id: newMessage.id,
                content: newMessage.content,
                role: newMessage.role,
                createdAt: newMessage.createdAt,
              })
            );
          });

          return {
            response: newMessage.content,
          };
        }
      ),
    },
  });
};

export type ConversationsService = ReturnType<typeof makeConversationsService>;
