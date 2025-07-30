import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import {
  PasswordSettingsComponent,
  type PasswordSettingsProperties
} from '~/features/settings/components/password-settings'
import { createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  state = faker.helpers.arrayElement(['idle', 'submitting']),
  errors = {}
}: Partial<PasswordSettingsProperties> = {}): PasswordSettingsProperties => ({
  state,
  errors
})

describe('Password Setting Component', () => {
  test('given idle state: should render the idle state', () => {
    const path = '/settings/password'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <PasswordSettingsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  test('given submitting state: should render the submitting state', () => {
    const path = '/settings/password'
    const properties = createProperties({
      state: 'submitting'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <PasswordSettingsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  test('given errors: should render the error message', () => {
    const path = '/settings/password'
    const properties = createProperties({
      state: 'idle',
      errors: {
        current_password: `current_password - ${faker.lorem.sentence()}`,
        message: `message - ${faker.lorem.sentence()}`
      }
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <PasswordSettingsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByText(properties.errors?.current_password ?? '')
    ).toBeInTheDocument()
    expect(
      screen.getByText(properties.errors?.message ?? '')
    ).toBeInTheDocument()
  })
})
