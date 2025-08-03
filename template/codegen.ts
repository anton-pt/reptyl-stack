import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'apps/application-server/schema.graphql',

  documents: ['apps/webapp/src/graphql/**/*.ts'],
  generates: {
    'apps/webapp/src/types/index.ts': {
      plugins: ['typescript', 'typescript-operations'],
    },
    'apps/application-server/src/graphql/models.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
};

export default config;
