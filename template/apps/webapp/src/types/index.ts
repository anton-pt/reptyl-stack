export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type ConnectedToConversation = {
  __typename?: 'ConnectedToConversation';
  conversationId: Scalars['ID']['output'];
};

export type Conversation = {
  __typename?: 'Conversation';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  messages?: Maybe<Array<Message>>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ConversationMessage = {
  __typename?: 'ConversationMessage';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  role: Role;
};

export type ConversationUpdate = ConnectedToConversation | ConversationMessage | ResponsePart;

export type Message = {
  __typename?: 'Message';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  role: Role;
  updatedAt: Scalars['DateTime']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createConversation: Conversation;
  sendMessage: Scalars['ID']['output'];
};


export type MutationCreateConversationArgs = {
  title: Scalars['String']['input'];
};


export type MutationSendMessageArgs = {
  conversationId: Scalars['ID']['input'];
  message: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  conversation?: Maybe<Conversation>;
  conversations: Array<Conversation>;
};


export type QueryConversationArgs = {
  id: Scalars['ID']['input'];
};

export type ResponsePart = {
  __typename?: 'ResponsePart';
  responsePart: Scalars['String']['output'];
  role: Role;
  userMessageId: Scalars['ID']['output'];
};

export enum Role {
  Assistant = 'ASSISTANT',
  User = 'USER'
}

export type Subscription = {
  __typename?: 'Subscription';
  conversationUpdated: ConversationUpdate;
};


export type SubscriptionConversationUpdatedArgs = {
  conversationId: Scalars['ID']['input'];
};

export type GetConversationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetConversationsQuery = { __typename?: 'Query', conversations: Array<{ __typename?: 'Conversation', id: string, title?: string | null, createdAt: any, updatedAt: any }> };

export type GetConversationQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetConversationQuery = { __typename?: 'Query', conversation?: { __typename?: 'Conversation', id: string, title?: string | null, createdAt: any, updatedAt: any, messages?: Array<{ __typename?: 'Message', id: string, content: string, role: Role, createdAt: any, updatedAt: any }> | null } | null };

export type CreateConversationMutationVariables = Exact<{
  title: Scalars['String']['input'];
}>;


export type CreateConversationMutation = { __typename?: 'Mutation', createConversation: { __typename?: 'Conversation', id: string, title?: string | null, createdAt: any, updatedAt: any } };

export type SendMessageMutationVariables = Exact<{
  conversationId: Scalars['ID']['input'];
  message: Scalars['String']['input'];
}>;


export type SendMessageMutation = { __typename?: 'Mutation', sendMessage: string };

export type ConversationUpdatedSubscriptionVariables = Exact<{
  conversationId: Scalars['ID']['input'];
}>;


export type ConversationUpdatedSubscription = { __typename?: 'Subscription', conversationUpdated: { __typename?: 'ConnectedToConversation', conversationId: string } | { __typename?: 'ConversationMessage', id: string, role: Role, content: string, createdAt: any } | { __typename?: 'ResponsePart', userMessageId: string, role: Role, responsePart: string } };
