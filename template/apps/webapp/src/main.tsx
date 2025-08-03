import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  split,
  HttpLink,
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

import App from './App.tsx';
import './styles.css';

const httpLink = new HttpLink({
  uri: '/api/graphql',
});

// Create WebSocket URL based on current location
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = import.meta.env.DEV 
  ? `${wsProtocol}//${window.location.host}/api/graphql`
  : `${wsProtocol}//${window.location.host}/api/graphql`;

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUrl,
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
);
