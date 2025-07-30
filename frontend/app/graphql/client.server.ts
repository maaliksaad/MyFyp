import Apollo from '@apollo/client'
import invariant from 'tiny-invariant'

const { ApolloClient, InMemoryCache, createHttpLink } = Apollo

const { SERVER_URI } = process.env

invariant(SERVER_URI, 'SERVER_URI is not defined')

const client = new ApolloClient({
  ssrMode: true,
  link: createHttpLink({
    uri: `${SERVER_URI}/graphql`
  }),
  cache: new InMemoryCache()
})

export const gql = Apollo.gql
export const ApolloError = Apollo.ApolloError

export const mutate = async <T>({
  mutation,
  variables,
  headers
}: {
  mutation: Apollo.DocumentNode
  variables?: Record<string, unknown>
  headers?: Record<string, string>
}): Promise<{
  data?: T
  errors?: Record<string, string>
}> => {
  try {
    const { data } = await client.mutate({
      mutation,
      variables,
      context: {
        headers
      }
    })

    return { data }
  } catch (error) {
    return {
      errors: formatError(error)
    }
  }
}

export const query = async <T>({
  query: queryString,
  variables,
  headers
}: {
  query: Apollo.DocumentNode
  variables?: Record<string, unknown>
  headers?: Record<string, string>
}): Promise<{
  data?: T
  errors?: Record<string, string>
}> => {
  try {
    const { data } = await client.query({
      query: queryString,
      variables,
      context: {
        headers
      },
      fetchPolicy: 'no-cache'
    })

    return { data }
  } catch (error) {
    return {
      errors: formatError(error)
    }
  }
}

function formatError(error: unknown): Record<string, string> {
  if (error instanceof ApolloError) {
    if (error.graphQLErrors.length === 0) {
      return {
        message: 'Unexpected Error'
      }
    }

    return Object.assign(
      {},
      ...error.graphQLErrors.map(errorMessage => {
        if (typeof errorMessage.message === 'string') {
          return {
            message: errorMessage.message
          }
        }

        const message = errorMessage.message[
          Object.keys(errorMessage.message)[0]
        ] as string[]

        return {
          [Object.keys(errorMessage.message)[0]]: Array.isArray(message)
            ? message.join(', ')
            : message
        }
      })
    )
  }

  return {
    message: 'Unexpected Error'
  }
}
