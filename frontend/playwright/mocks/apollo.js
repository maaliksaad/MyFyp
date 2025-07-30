import { ApolloServer } from '@apollo/server'
import { faker } from '@faker-js/faker'
import { loadSchemaSync } from '@graphql-tools/load'
import { addMocksToSchema } from '@graphql-tools/mock'
import { UrlLoader } from '@graphql-tools/url-loader'
import { config } from 'dotenv'
import invariant from 'tiny-invariant'

config()

const { GRAPHQL_URI } = process.env

invariant(GRAPHQL_URI, 'GRAPHQL_URI is not defined')

const mocks = {
  Int: () => faker.number.int({ min: 1, max: 1000 }),
  Float: () => faker.number.float({ min: 1, max: 1000 }),
  String: () => faker.lorem.word(),
  DateTime: () => faker.date.recent(),
  User: () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    verified: true
  }),
  UserWithToken: () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    verified: true,
    token: faker.string.alpha(32)
  }),
  Scan: () => ({
    scan_id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.lorem.word(),
    status: faker.helpers.arrayElement(['Preparing', 'Completed', 'Failed'])
  }),
  File: () => ({
    file_id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.system.fileName(),
    key: faker.string.alphanumeric({ length: 10 }),
    bucket: faker.lorem.word(),
    url: faker.internet.url(),
    type: faker.helpers.arrayElement(['Video', 'Image']),
    mimetype: faker.system.mimeType(),
    thumbnail: faker.image.url()
  }),
  Activity: () => ({
    entity: faker.helpers.arrayElement(['project', 'scan']),
    metadata: {}
  }),
  Notification: () => ({
    metadata: {}
  })
}

const server = new ApolloServer({
  schema: addMocksToSchema({
    schema: loadSchemaSync(GRAPHQL_URI, {
      loaders: [new UrlLoader()]
    }),
    mocks
  })
})

export const apollo = server
