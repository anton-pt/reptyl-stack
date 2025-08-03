import React from 'react';
import { Message } from '../types';

interface MessageComponentProps {
  message: Message;
  isStreaming?: boolean;
  streamingContent?: string;
}

export const MessageComponent: React.FC<MessageComponentProps> = ({
  message,
  isStreaming,
  streamingContent,
}) => {
  const isUser = message.role === 'USER';
  const displayContent =
    isStreaming && streamingContent !== undefined
      ? message.content + streamingContent
      : message.content;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'rounded-br-sm bg-blue-600 text-white'
              : 'rounded-bl-sm bg-gray-100 text-gray-900'
          }`}
        >
          <div className="break-words whitespace-pre-wrap">
            {displayContent}
            {isStreaming && (
              <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-current" />
            )}
          </div>
        </div>
        <div
          className={`mt-1 text-xs text-gray-500 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
          isUser
            ? 'order-1 ml-3 bg-blue-600 text-white'
            : 'order-2 mr-3 bg-gray-300 text-gray-700'
        }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>
    </div>
  );
};
