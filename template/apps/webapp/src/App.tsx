import React, { useState } from 'react';
import { ConversationSidebar } from './components/ConversationSidebar';
import { ChatArea } from './components/ChatArea';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowSidebar(false); // Close sidebar on mobile when conversation is selected
  };

  return (
    <div className="relative flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-4 left-4 z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-lg lg:hidden"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {showSidebar && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={` ${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0`}
      >
        <ErrorBoundary>
          <ConversationSidebar
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
          />
        </ErrorBoundary>
      </div>

      {/* Main chat area */}
      <div className="flex-1 lg:ml-0">
        <ErrorBoundary>
          <ChatArea conversationId={selectedConversationId} />
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
