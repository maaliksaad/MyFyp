import type { CodegenConfig } from '@graphql-codegen/cli'
import { config } from 'dotenv'
import invariant from 'tiny-invariant'

config()

const { SERVER_URI } = process.env

invariant(SERVER_URI, 'SERVER_URI is not defined')

const graphqlConfig: CodegenConfig = {
  schema: `${SERVER_URI}/graphql`,
  documents: ['app/**/*.tsx'],
  generates: {
    './app/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations']
    }
  },
  ignoreNoDocuments: true
}

export default graphqlConfig
