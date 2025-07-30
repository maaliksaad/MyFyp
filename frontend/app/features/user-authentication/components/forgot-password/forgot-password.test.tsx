import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import {
  ForgotPasswordComponent,
  type ForgotPasswordProperties
} from '~/features/user-authentication/components/forgot-password'
import { createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  state = faker.helpers.arrayElement(['idle', 'submitting']),
  errors = {},
  email = faker.internet.email(),
  success = false
}: Partial<ForgotPasswordProperties>): ForgotPasswordProperties => ({
  state,
  errors,
  email,
  success
})

describe('Forgot Password Component', () => {
  test('given a state of idle: renders the idle state', async () => {
    const path = '/forgot-password'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ForgotPasswordComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { name: /forgot password/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /continue/i })
    ).toBeInTheDocument()
  })

  test('given success: should render the success message', async () => {
    const path = '/forgot-password'
    const properties = createProperties({
      success: true
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ForgotPasswordComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByText(
        /if the email exists in our system, a password reset email will be sent/i
      )
    ).toBeInTheDocument()
  })

  test('given a state of submitting: renders the submitting state', async () => {
    const path = '/forgot-password'
    const properties = createProperties({
      state: 'submitting'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ForgotPasswordComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('button', { name: /sending link/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /sending link/i })).toBeDisabled()
  })

  test('given the errors: renders the errors', async () => {
    const path = '/forgot-password'
    const properties = createProperties({
      errors: {
        email: faker.lorem.sentence(),
        message: faker.lorem.sentence()
      }
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ForgotPasswordComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByText(properties.errors?.email ?? '')).toBeInTheDocument()

    expect(
      screen.getByText(properties.errors?.message ?? '')
    ).toBeInTheDocument()
  })
})
