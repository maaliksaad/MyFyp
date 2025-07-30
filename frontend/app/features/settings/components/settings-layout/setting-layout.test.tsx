import * as remix from '@remix-run/react'
import { fireEvent, waitFor } from '@testing-library/dom'
import { describe, expect, test, vi } from 'vitest'

import { SettingsLayoutComponent } from '~/features/settings/components/settings-layout'
import { createRemixStub, render, screen } from '~/test/react-test-utils'

vi.mock('@remix-run/react', async () => ({
  __esModule: true,
  ...(await vi.importActual('@remix-run/react'))
}))

describe('Setting Layout Component', () => {
  test('should render the idle state', () => {
    const path = '/settings/account'

    const RemixStub = createRemixStub([
      {
        path,
        Component: properties => <SettingsLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('combobox', { name: /select a tab/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /account/i })).toHaveAttribute(
      'href',
      '/settings/account'
    )

    expect(screen.getByRole('link', { name: /password/i })).toHaveAttribute(
      'href',
      '/settings/password'
    )

    expect(screen.getByRole('link', { name: /billing/i })).toHaveAttribute(
      'href',
      '/settings/billing'
    )

    expect(
      screen.getByRole('link', { name: /notifications/i })
    ).toHaveAttribute('href', '/settings/notifications')
  })

  test('clicking the tab: should call navigate method', async () => {
    const navigate = vi.fn()

    vi.spyOn(remix, 'useNavigate').mockReturnValue(navigate)

    const path = '/settings/account'
    const RemixStub = createRemixStub([
      {
        path,
        Component: properties => <SettingsLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    await waitFor(() => {
      fireEvent.change(
        screen.getByRole('combobox', { name: /select a tab/i }),
        {
          target: {
            value: 'Password'
          }
        }
      )
    })

    expect(navigate).toHaveBeenCalledWith('Password')
  })
})
