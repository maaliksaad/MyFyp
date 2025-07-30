import { describe, expect, test } from 'vitest'

import { AuthLayoutComponent } from '~/features/user-authentication/components/auth-layout/index'
import { createRemixStub, render, screen } from '~/test/react-test-utils'

describe('Auth Layout Component', () => {
  test('should render the auth layout', () => {
    const path = '/signup'
    const RemixStub = createRemixStub([
      { path, Component: properties => <AuthLayoutComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByRole('link', { name: 'Logo' })).toBeInTheDocument()

    expect(
      screen.getByRole('img', { name: /auth banner/i })
    ).toBeInTheDocument()
  })
})
