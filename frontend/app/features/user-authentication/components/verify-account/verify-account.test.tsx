import { faker } from '@faker-js/faker'
import * as remix from '@remix-run/react'
import { describe, expect, test, vi } from 'vitest'

import {
  VerifyAccountComponent,
  type VerifyAccountProperties
} from '~/features/user-authentication/components/verify-account/index'
import { act, createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  state = faker.helpers.arrayElement(['idle', 'submitting']),
  errors = {},
  data = {
    id: faker.number.int(),
    token: faker.string.alpha(32)
  }
}: Partial<VerifyAccountProperties>): VerifyAccountProperties => ({
  state,
  errors,
  data
})

vi.mock('@remix-run/react', async () => ({
  __esModule: true,
  ...(await vi.importActual('@remix-run/react'))
}))

describe('Verify Account Component', () => {
  test('given a state of idle: renders the idle state', async () => {
    const path = '/verify-account'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <VerifyAccountComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { name: /verify account/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument()
  })

  test('given a state of submitting: renders the submitting state', async () => {
    const path = '/verify-account'
    const properties = createProperties({
      state: 'submitting'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <VerifyAccountComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('button', { name: /verifying/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /verifying/i })).toBeDisabled()
  })

  test('given the errors: renders the errors', async () => {
    const path = '/verify-account'
    const properties = createProperties({
      errors: {
        message: faker.lorem.sentence()
      }
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <VerifyAccountComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByText(properties.errors?.message ?? '')
    ).toBeInTheDocument()
  })

  test('clicking the button: should call handleSubmit', async () => {
    const submit = vi.fn()

    vi.spyOn(remix, 'useSubmit').mockReturnValue(submit)

    const path = '/verify-account'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <VerifyAccountComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const button = screen.getByRole('button', { name: /verify/i })

    await act(async () => {
      button.click()
    })

    expect(submit).toBeCalled()
  })
})
