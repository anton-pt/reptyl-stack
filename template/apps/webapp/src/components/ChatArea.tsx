import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import {
  GET_CONVERSATION,
  SEND_MESSAGE,
  CONVERSATION_UPDATED,
} from '../graphql/operations';
import {
  Message,
  ConversationUpdate,
  ConversationMessage,
  ResponsePart,
} from '../types';
import { MessageComponent } from './MessageComponent';
import { MessageInput } from './MessageInput';
import { LoadingSpinner, TypingIndicator } from './LoadingSpinner';

interface ChatAreaProps {
  conversationId: string | null;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<{
    messageId: string;
    content: string;
  } | null>(null);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, loading, error } = useQuery(GET_CONVERSATION, {
    variables: { id: conversationId },
    skip: !conversationId,
    onCompleted: (data) => {
      if (data?.conversation?.messages) {
        setMessages(data.conversation.messages);
        setStreamingMessage(null);
        setIsAssistantTyping(false);
      }
    },
  });

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);

  // Subscribe to conversation updates
  useSubscription(CONVERSATION_UPDATED, {
    variables: { conversationId },
    skip: !conversationId,
    onData: ({ data }) => {
      const update: ConversationUpdate = data.data?.conversationUpdated;
      if (!update) return;

      if (update.__typename === 'ConversationMessage') {
        const newMessage = update as ConversationMessage;
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (exists) return prev;

          return [
            ...prev,
            {
              id: newMessage.id,
              content: newMessage.content,
              role: newMessage.role,
              createdAt: newMessage.createdAt,
              updatedAt: newMessage.createdAt,
            },
          ];
        });

        // Clear streaming state when we get a complete message
        if (newMessage.role === 'ASSISTANT') {
          setStreamingMessage(null);
          setIsAssistantTyping(false);
        }
      } else if (update.__typename === 'ResponsePart') {
        const responsePart = update as ResponsePart;
        setIsAssistantTyping(true);

        setStreamingMessage((prev) => {
          if (prev && prev.messageId === responsePart.userMessageId) {
            return {
              ...prev,
              content: prev.content + responsePart.responsePart,
            };
          } else {
            return {
              messageId: responsePart.userMessageId,
              content: responsePart.responsePart,
            };
          }
        });
      }
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleSendMessage = async (messageContent: string) => {
    if (!conversationId) return;

    try {
      setIsAssistantTyping(true);
      await sendMessage({
        variables: {
          conversationId,
          message: messageContent,
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsAssistantTyping(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-700">
            Welcome to AI Chat
          </h2>
          <p className="text-gray-500">
            Select a conversation or create a new one to start chatting
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-gray-600">Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-red-600">Error loading conversation</div>
          <div className="text-sm text-gray-500">{error.message}</div>
        </div>
      </div>
    );
  }

  const conversation = data?.conversation;
  const allMessages = messages;

  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {conversation?.title || 'Chat'}
        </h1>
        <p className="text-sm text-gray-500">{allMessages.length} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {allMessages.length === 0 ? (
          <div className="mt-8 text-center text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          allMessages.map((message, index) => {
            const isLastAssistantMessage =
              message.role === 'ASSISTANT' &&
              index === allMessages.length - 1 &&
              isAssistantTyping;

            return (
              <MessageComponent
                key={message.id}
                message={message}
                isStreaming={isLastAssistantMessage}
                streamingContent={
                  isLastAssistantMessage ? streamingMessage?.content : undefined
                }
              />
            );
          })
        )}

        {/* Show streaming message if assistant is typing and we have streaming content but no complete message yet */}
        {isAssistantTyping && streamingMessage && (
          <div className="mb-4 flex justify-start">
            <div className="max-w-[70%]">
              <div className="rounded-lg rounded-bl-sm bg-gray-100 px-4 py-2 text-gray-900">
                <div className="break-words whitespace-pre-wrap">
                  {streamingMessage.content}
                  <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-current" />
                </div>
              </div>
            </div>
            <div className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-gray-700">
              AI
            </div>
          </div>
        )}

        {/* Show typing indicator if assistant is typing but no streaming content yet */}
        {isAssistantTyping && !streamingMessage && (
          <div className="mb-4 flex justify-start">
            <div className="max-w-[70%]">
              <div className="rounded-lg rounded-bl-sm bg-gray-100 px-4 py-2 text-gray-900">
                <TypingIndicator />
              </div>
            </div>
            <div className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-gray-700">
              AI
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sending || isAssistantTyping}
        placeholder={
          isAssistantTyping ? 'Assistant is typing...' : 'Type your message...'
        }
      />
    </div>
  );
};
