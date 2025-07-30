import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import {
  AccountSettingsComponent,
  type AccountSettingsProperties
} from '~/features/settings/components/account-settings'
import { createPopulatedUser } from '~/test/factories'
import { act, createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  state = faker.helpers.arrayElement(['idle', 'submitting']),
  errors = {},
  user = createPopulatedUser(),
  images = [faker.image.url(), faker.image.url()]
}: Partial<AccountSettingsProperties> = {}): AccountSettingsProperties => ({
  state,
  errors,
  user,
  images
})

describe('Account Setting Component', () => {
  test('given idle state: should render the idle state', () => {
    const path = '/settings/account'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <AccountSettingsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  test('given submitting state: should render the submitting state', () => {
    const path = '/settings/account'
    const properties = createProperties({
      state: 'submitting'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <AccountSettingsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  test('given errors: should render the error message', () => {
    const path = '/settings/account'
    const properties = createProperties({
      state: 'idle',
      errors: {
        name: `name - ${faker.lorem.sentence()}`,
        message: `message - ${faker.lorem.sentence()}`
      }
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <AccountSettingsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByText(properties.errors?.name ?? '')).toBeInTheDocument()
    expect(
      screen.getByText(properties.errors?.message ?? '')
    ).toBeInTheDocument()
  })

  test('clicking an image: should change the selected image', async () => {
    const path = '/settings/account'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <AccountSettingsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const image = screen.getByAltText(/avatar-0/i)

    await act(async () => {
      image.click()
    })

    expect(image).toHaveAttribute('data-selected', 'true')
  })
})
