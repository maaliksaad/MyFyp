import { describe, expect, test } from 'vitest'

import { NotificationSettingsComponent } from '~/features/settings/components/notification-settings'
import { createRemixStub, render, screen } from '~/test/react-test-utils'

describe('Notification setting Component', () => {
  test('given idle state: should render the idle state', () => {
    const path = '/settings/notifications'

    const RemixStub = createRemixStub([
      {
        path,
        Component: properties => (
          <NotificationSettingsComponent {...properties} />
        )
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('checkbox', { name: /account/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('checkbox', { name: /projects/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('checkbox', { name: /scans/i })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })
})
