import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import {
  SignupComponent,
  type SignupProperties
} from '~/features/user-authentication/components/signup/index'
import { createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  state = faker.helpers.arrayElement(['idle', 'submitting']),
  errors = {},
  name = faker.person.fullName(),
  email = faker.internet.email(),
  success = false
}: Partial<SignupProperties>): SignupProperties => ({
  state,
  errors,
  name,
  email,
  success
})

describe('Signup Component', () => {
  test('given a state of idle: renders the idle state', async () => {
    const path = '/signup'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <SignupComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { name: /sign up/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()

    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()

    expect(
      screen.getByRole('checkbox', {
        name: /i have read and agree to the terms of use and privacy policy/i
      })
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /terms/i })).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: /privacy policy/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument()
  })

  test('given a state of submitting: renders the submitting state', async () => {
    const path = '/signup'
    const properties = createProperties({ state: 'submitting' })

    const RemixStub = createRemixStub([
      { path, Component: () => <SignupComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('button', { name: /creating account/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /creating account/i })
    ).toBeDisabled()
  })

  test('given the errors: renders the errors', async () => {
    const path = '/signup'
    const properties = createProperties({
      errors: {
        name: faker.lorem.sentence(),
        message: faker.lorem.sentence()
      }
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <SignupComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByText(properties.errors?.name ?? '')).toBeInTheDocument()

    expect(
      screen.getByText(properties.errors?.message ?? '')
    ).toBeInTheDocument()
  })

  test('given the success: renders the success message', async () => {
    const path = '/signup'
    const properties = createProperties({ success: true })

    const RemixStub = createRemixStub([
      { path, Component: () => <SignupComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByText(
        /account created successfully. please check your email to verify your account./i
      )
    ).toBeInTheDocument()
  })
})
