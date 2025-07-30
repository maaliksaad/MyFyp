import { faker } from '@faker-js/faker'
import * as remix from '@remix-run/react'
import { describe, expect, test, vi } from 'vitest'

import {
  NotificationsListComponent,
  type NotificationsListProperties
} from '~/features/notifications/components/notifications-list'
import { createPopulatedNotification } from '~/test/factories'
import { act, createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  open = faker.datatype.boolean(),
  setOpen = vi.fn(),
  notifications = []
}: Partial<NotificationsListProperties>): NotificationsListProperties => ({
  open,
  setOpen,
  notifications
})

vi.mock('@remix-run/react', async () => ({
  __esModule: true,
  ...(await vi.importActual('@remix-run/react'))
}))

describe('Notification List component', () => {
  test('given closed state: should not render the slide over', async () => {
    const path = '/notifications'
    const properties = createProperties({
      open: false
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <NotificationsListComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.queryByRole('heading', { level: 2, name: /notifications/i })
    ).not.toBeInTheDocument()
  })

  test('given open state: should render the slide over', async () => {
    const path = '/notifications'
    const properties = createProperties({
      open: true
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <NotificationsListComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { level: 2, name: /notifications/i })
    ).toBeInTheDocument()
  })

  test('given no notification: should render the empty state', async () => {
    const path = '/notifications'
    const properties = createProperties({
      open: true
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <NotificationsListComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByText(/no notifications/i)).toBeInTheDocument()
  })

  test('given the notification: should render the notifications', async () => {
    const path = '/notifications'
    const properties = createProperties({
      open: true,
      notifications: [
        createPopulatedNotification({
          read: true,
          metadata: {
            thumbnail: faker.image.url()
          }
        }),
        createPopulatedNotification({ read: false })
      ]
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <NotificationsListComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    properties.notifications.forEach(notification => {
      expect(screen.getByText(notification.title)).toBeInTheDocument()
      expect(screen.getByAltText(notification.title)).toBeInTheDocument()
    })
  })

  test('clicking the read notifications button: should submit the form', async () => {
    const submit = vi.fn()

    vi.spyOn(remix, 'useSubmit').mockReturnValue(submit)

    const path = '/notifications'
    const properties = createProperties({
      open: true,
      notifications: [
        createPopulatedNotification({
          read: true,
          metadata: {
            thumbnail: faker.image.url()
          }
        }),
        createPopulatedNotification({ read: false })
      ]
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <NotificationsListComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const button = screen.getByRole('button', { name: /read notifications/i })

    expect(button).toBeInTheDocument()

    await act(async () => {
      button.click()
    })

    expect(submit).toHaveBeenCalledWith(
      {
        location: '/notifications'
      },
      {
        method: 'post',
        action: '/notifications',
        replace: true
      }
    )
  })
})
