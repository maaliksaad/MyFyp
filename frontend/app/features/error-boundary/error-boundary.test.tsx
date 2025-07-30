import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import {
  ErrorBoundaryComponent,
  type ErrorBoundaryProperties
} from '~/features/error-boundary'
import { createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  error = faker.lorem.word(),
  description = faker.lorem.text()
}: Partial<ErrorBoundaryProperties>): ErrorBoundaryProperties => ({
  error,
  description
})

describe('NotFound component', () => {
  test('given a link: renders error messages and the correct link', async () => {
    const path = '/some-non-existent-page'
    const properties = createProperties({
      error: 'Not Found',
      description: 'The page you are looking for does not exist.'
    })

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <ErrorBoundaryComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { level: 1, name: /not found/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute(
      'href',
      '/'
    )
  })
})
