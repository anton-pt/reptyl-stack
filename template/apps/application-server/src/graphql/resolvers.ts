import {
  ConversationUpdate,
  parseConversationUpdate,
} from '@reptyl/domain-model';
import { Dependencies } from '../dependencies.js';
import { Resolvers, Role } from './models.js';

export const resolvers: Resolvers<Dependencies> = {
  Query: {
    conversations: async (_, __, { restateClient }) => {
      const conversations =
        await restateClient.conversationsServiceClient.getConversations();
      return conversations.conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        createdAt: new Date(conversation.createdAt),
        updatedAt: new Date(conversation.updatedAt),
      }));
    },
    conversation: async (_, { id }, { restateClient }) => {
      const conversation =
        await restateClient.conversationsServiceClient.getConversationById({
          conversationId: id,
        });
      return {
        id: conversation.conversation.id,
        title: conversation.conversation.title,
        createdAt: new Date(conversation.conversation.createdAt),
        updatedAt: new Date(conversation.conversation.updatedAt),
      };
    },
  },
  Mutation: {
    createConversation: async (_, { title }, { restateClient }) => {
      const { conversationId } =
        await restateClient.conversationsServiceClient.createConversation({
          title,
        });

      const conversation =
        await restateClient.conversationsServiceClient.getConversationById({
          conversationId,
        });

      if (!conversation.conversation) {
        throw new Error('Conversation not found');
      }

      return {
        id: conversation.conversation.id,
        title: conversation.conversation.title,
        createdAt: new Date(conversation.conversation.createdAt),
        updatedAt: new Date(conversation.conversation.updatedAt),
      };
    },
    sendMessage: async (_, { conversationId, message }, { restateClient }) => {
      const newMessage =
        await restateClient.conversationsServiceClient.sendMessage({
          conversationId,
          message,
        });

      return newMessage.messageId;
    },
  },
  Subscription: {
    conversationUpdated: {
      async subscribe(_, { conversationId }, { logger }) {
        const ws = new WebSocket(
          `ws://localhost:8082/conversations/${conversationId}/updates`
        );

        const messageQueue: any[] = [];
        let resolveNext: ((value: any) => void) | null = null;
        let isConnected = true;

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (resolveNext) {
              resolveNext(data);
              resolveNext = null;
            } else {
              messageQueue.push(data);
            }
          } catch (error) {
            logger.error(error, 'Failed to parse WebSocket message:');
          }
        };

        ws.onerror = (error) => {
          logger.error(error, 'WebSocket error');
          isConnected = false;
          if (resolveNext) {
            resolveNext(null);
            resolveNext = null;
          }
        };

        ws.onclose = () => {
          logger.debug('WebSocket connection closed');
          isConnected = false;
          if (resolveNext) {
            resolveNext(null);
            resolveNext = null;
          }
        };

        const cleanup = () => {
          console.log('Cleaning up WebSocket connection');
          isConnected = false;
          if (
            ws.readyState === WebSocket.OPEN ||
            ws.readyState === WebSocket.CONNECTING
          ) {
            ws.close();
          }
          if (resolveNext) {
            resolveNext(null);
            resolveNext = null;
          }
        };

        const generator = (async function* () {
          try {
            while (isConnected) {
              let message;
              if (messageQueue.length > 0) {
                message = messageQueue.shift();
              } else {
                message = await new Promise((resolve) => {
                  resolveNext = resolve;
                });
              }

              if (message === null) break;
              yield parseConversationUpdate(message);
            }
          } finally {
            cleanup();
          }
        })();

        // Override the return method to handle early termination
        const originalReturn = generator.return.bind(generator);
        generator.return = async (value) => {
          cleanup();
          return originalReturn(value);
        };

        return generator;
      },
      resolve: (payload: ConversationUpdate) => {
        switch (payload.kind) {
          case 'connectedToConversation':
            return {
              kind: 'connectedToConversation',
              conversationId: payload.conversationId,
            };
          case 'message':
            return {
              kind: 'conversationMessage',
              id: payload.id,
              role: payload.role === 'user' ? Role.User : Role.Assistant,
              content: payload.content,
              createdAt: new Date(payload.createdAt),
            };
          case 'responsePart':
            return {
              kind: 'responsePart',
              userMessageId: payload.userMessageId,
              role: Role.Assistant,
              responsePart: payload.responsePart,
            };
        }
      },
    },
  },
  Conversation: {
    messages: async (conversation, _, { restateClient }) => {
      const messages =
        await restateClient.conversationsServiceClient.getMessagesForConversation(
          {
            conversationId: conversation.id,
          }
        );
      return messages.messages.map((message) => ({
        id: message.id,
        content: message.content,
        role: message.role === 'user' ? Role.User : Role.Assistant,
        createdAt: new Date(message.createdAt),
        updatedAt: new Date(message.updatedAt),
      }));
    },
  },
  ConversationUpdate: {
    __resolveType(obj) {
      const { kind } = obj as any;

      switch (kind) {
        case 'connectedToConversation':
          return 'ConnectedToConversation';
        case 'conversationMessage':
          return 'ConversationMessage';
        case 'responsePart':
          return 'ResponsePart';
        default:
          return null; // GraphQL will throw an error if no type is matched
      }
    },
  },
};
