import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import {
  LoginComponent,
  type LoginProperties
} from '~/features/user-authentication/components/login/index'
import { createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  state = faker.helpers.arrayElement(['idle', 'submitting']),
  errors = {},
  email = faker.internet.email()
}: Partial<LoginProperties>): LoginProperties => ({
  state,
  errors,
  email
})

describe('Login Component', () => {
  test('given a state of idle: renders the idle state', async () => {
    const path = '/login'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <LoginComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /signup/i })).toBeInTheDocument()

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()

    expect(
      screen.getByRole('checkbox', { name: /remember me/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: /forgot password/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  test('given a state of submitting: renders the submitting state', async () => {
    const path = '/login'
    const properties = createProperties({
      state: 'submitting'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <LoginComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('button', { name: /logging in/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
  })

  test('given the errors: renders the errors', async () => {
    const path = '/login'
    const properties = createProperties({
      errors: {
        email: faker.lorem.sentence(),
        message: faker.lorem.sentence()
      }
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <LoginComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByText(properties.errors?.email ?? '')).toBeInTheDocument()

    expect(
      screen.getByText(properties.errors?.message ?? '')
    ).toBeInTheDocument()
  })
})
