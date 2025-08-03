import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
  ConversationUpdate: ( ConnectedToConversation ) | ( ConversationMessage ) | ( ResponsePart );
};


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ConnectedToConversation: ResolverTypeWrapper<ConnectedToConversation>;
  Conversation: ResolverTypeWrapper<Conversation>;
  ConversationMessage: ResolverTypeWrapper<ConversationMessage>;
  ConversationUpdate: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ConversationUpdate']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Message: ResolverTypeWrapper<Message>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  ResponsePart: ResolverTypeWrapper<ResponsePart>;
  Role: Role;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  ConnectedToConversation: ConnectedToConversation;
  Conversation: Conversation;
  ConversationMessage: ConversationMessage;
  ConversationUpdate: ResolversUnionTypes<ResolversParentTypes>['ConversationUpdate'];
  DateTime: Scalars['DateTime']['output'];
  ID: Scalars['ID']['output'];
  Message: Message;
  Mutation: {};
  Query: {};
  ResponsePart: ResponsePart;
  String: Scalars['String']['output'];
  Subscription: {};
};

export type ConnectedToConversationResolvers<ContextType = any, ParentType extends ResolversParentTypes['ConnectedToConversation'] = ResolversParentTypes['ConnectedToConversation']> = {
  conversationId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConversationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Conversation'] = ResolversParentTypes['Conversation']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  messages?: Resolver<Maybe<Array<ResolversTypes['Message']>>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConversationMessageResolvers<ContextType = any, ParentType extends ResolversParentTypes['ConversationMessage'] = ResolversParentTypes['ConversationMessage']> = {
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ConversationUpdateResolvers<ContextType = any, ParentType extends ResolversParentTypes['ConversationUpdate'] = ResolversParentTypes['ConversationUpdate']> = {
  __resolveType: TypeResolveFn<'ConnectedToConversation' | 'ConversationMessage' | 'ResponsePart', ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type MessageResolvers<ContextType = any, ParentType extends ResolversParentTypes['Message'] = ResolversParentTypes['Message']> = {
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createConversation?: Resolver<ResolversTypes['Conversation'], ParentType, ContextType, RequireFields<MutationCreateConversationArgs, 'title'>>;
  sendMessage?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationSendMessageArgs, 'conversationId' | 'message'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  conversation?: Resolver<Maybe<ResolversTypes['Conversation']>, ParentType, ContextType, RequireFields<QueryConversationArgs, 'id'>>;
  conversations?: Resolver<Array<ResolversTypes['Conversation']>, ParentType, ContextType>;
};

export type ResponsePartResolvers<ContextType = any, ParentType extends ResolversParentTypes['ResponsePart'] = ResolversParentTypes['ResponsePart']> = {
  responsePart?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  userMessageId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  conversationUpdated?: SubscriptionResolver<ResolversTypes['ConversationUpdate'], "conversationUpdated", ParentType, ContextType, RequireFields<SubscriptionConversationUpdatedArgs, 'conversationId'>>;
};

export type Resolvers<ContextType = any> = {
  ConnectedToConversation?: ConnectedToConversationResolvers<ContextType>;
  Conversation?: ConversationResolvers<ContextType>;
  ConversationMessage?: ConversationMessageResolvers<ContextType>;
  ConversationUpdate?: ConversationUpdateResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Message?: MessageResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ResponsePart?: ResponsePartResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
};

