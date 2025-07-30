import { type GraphQLError, type GraphQLFormattedError } from 'graphql/error'

export class ErrorFormatter {
  // eslint-disable-next-line n/handle-callback-err
  constructor(private readonly error: GraphQLError) {}

  format(): GraphQLFormattedError {
    const data: {
      code?: string
      originalError?: {
        message: string[]
      }
    } = this.error.extensions

    if (data?.code === 'BAD_REQUEST') {
      return {
        // @ts-expect-error - can't spread GraphQLError
        message: this.formatBadRequestErrors(data.originalError?.message ?? [])
      }
    }

    return {
      message: this.error.message
    }
  }

  private formatBadRequestErrors(errors: string[]) {
    const formattedErrors: Record<string, string | string[]> = {}

    for (const error of errors) {
      const [key] = error.split(' ')

      if (formattedErrors[key] === undefined) {
        formattedErrors[key] = error
      } else if (typeof formattedErrors[key] === 'string') {
        // @ts-expect-error - can't push to string
        formattedErrors[key] = [formattedErrors[key], error]
      } else {
        // @ts-expect-error - can't push to string
        formattedErrors[key].push(error)
      }
    }

    return formattedErrors
  }
}
