import { describe, expect, test } from 'vitest'

import { BillingSettingsComponent } from '~/features/settings/components/billing-settings'
import { createRemixStub, render, screen } from '~/test/react-test-utils'

describe('Billing setting Component', () => {
  test('given idle state: should render the idle state', () => {
    const path = '/settings/billing'

    const RemixStub = createRemixStub([
      {
        path,
        Component: properties => <BillingSettingsComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { name: /no plans available/i })
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        /we don't have any plans available for you at the moment./i
      )
    ).toBeInTheDocument()
  })
})
