import { faker } from '@faker-js/faker'
import * as remix from '@remix-run/react'
import { fireEvent, waitFor } from '@testing-library/dom'
import { describe, expect, test, vi } from 'vitest'

import {
  ResetPasswordComponent,
  type ResetPasswordProperties
} from '~/features/user-authentication/components/reset-password'
import { act, createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  state = faker.helpers.arrayElement(['idle', 'submitting']),
  errors = {},
  data = {
    id: faker.number.int(),
    token: faker.internet.password()
  }
}: Partial<ResetPasswordProperties>): ResetPasswordProperties => ({
  state,
  errors,
  data
})

vi.mock('@remix-run/react', async () => ({
  __esModule: true,
  ...(await vi.importActual('@remix-run/react'))
}))

describe('Reset Password Component', () => {
  test('given a state of idle: renders the idle state', async () => {
    const path = '/reset-password'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ResetPasswordComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { name: /reset password/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /reset password/i })
    ).toBeInTheDocument()
  })

  test('given a state of submitting: renders the submitting state', async () => {
    const path = '/reset-password'
    const properties = createProperties({
      state: 'submitting'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ResetPasswordComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('button', { name: /resetting/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /resetting/i })).toBeDisabled()
  })

  test('given the errors: renders the errors', async () => {
    const path = '/reset-password'
    const properties = createProperties({
      errors: {
        message: faker.lorem.sentence()
      }
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ResetPasswordComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByText(properties.errors?.message ?? '')
    ).toBeInTheDocument()
  })

  test('clicking the reset password button: calls the handleSubmit function', async () => {
    const submit = vi.fn()

    vi.spyOn(remix, 'useSubmit').mockReturnValue(submit)

    const path = '/reset-password'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ResetPasswordComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    await waitFor(() => {
      const password = faker.internet.password()

      fireEvent.change(screen.getByLabelText(/enter password/i), {
        target: { value: password }
      })

      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: password }
      })
    })

    const button = screen.getByRole('button', { name: /reset password/i })

    await act(async () => {
      button.click()
    })

    expect(submit).toBeCalled()
  })
})
