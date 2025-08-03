import { gql } from '@apollo/client';

export const GET_CONVERSATIONS = gql`
  query GetConversations {
    conversations {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const GET_CONVERSATION = gql`
  query GetConversation($id: ID!) {
    conversation(id: $id) {
      id
      title
      createdAt
      updatedAt
      messages {
        id
        content
        role
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($title: String!) {
    createConversation(title: $title) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($conversationId: ID!, $message: String!) {
    sendMessage(conversationId: $conversationId, message: $message)
  }
`;

export const CONVERSATION_UPDATED = gql`
  subscription ConversationUpdated($conversationId: ID!) {
    conversationUpdated(conversationId: $conversationId) {
      ... on ConnectedToConversation {
        conversationId
      }
      ... on ConversationMessage {
        id
        role
        content
        createdAt
      }
      ... on ResponsePart {
        userMessageId
        role
        responsePart
      }
    }
  }
`;
