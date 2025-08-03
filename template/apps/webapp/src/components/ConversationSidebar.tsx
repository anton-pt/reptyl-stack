import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CONVERSATIONS, CREATE_CONVERSATION } from '../graphql/operations';
import { Conversation } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ConversationSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  selectedConversationId,
  onSelectConversation,
}) => {
  const { data, loading, error, refetch } = useQuery(GET_CONVERSATIONS);
  const [createConversation, { loading: creating }] = useMutation(
    CREATE_CONVERSATION,
    {
      onCompleted: (data) => {
        onSelectConversation(data.createConversation.id);
        refetch();
      },
    }
  );

  const handleCreateConversation = async () => {
    const title = `New Chat ${new Date().toLocaleTimeString()}`;
    await createConversation({
      variables: { title },
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="w-80 border-r border-gray-200 bg-gray-50 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 rounded bg-gray-200"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 border-r border-gray-200 bg-gray-50 p-4">
        <div className="text-sm text-red-600">
          Error loading conversations: {error.message}
        </div>
      </div>
    );
  }

  const conversations: Conversation[] = data?.conversations || [];

  return (
    <div className="flex h-full w-80 flex-col border-r border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 p-4">
        <button
          onClick={handleCreateConversation}
          disabled={creating}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:bg-blue-400"
        >
          {creating ? (
            <LoadingSpinner
              size="sm"
              className="border-white border-t-transparent"
            />
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No conversations yet. Create your first chat!
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full rounded-lg p-3 text-left transition-colors duration-200 ${
                  selectedConversationId === conversation.id
                    ? 'border border-blue-200 bg-blue-100'
                    : 'border border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="truncate text-sm font-medium text-gray-900">
                  {conversation.title || 'Untitled Chat'}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {formatTime(conversation.updatedAt)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
