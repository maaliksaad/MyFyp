import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import {
  DashboardLayoutComponent,
  type DashboardLayoutProperties
} from '~/features/dashboard/components/dashboard-layout'
import { createPopulatedNotification } from '~/test/factories'
import { act, createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  user = {
    name: faker.person.fullName(),
    picture: faker.image.avatar()
  },
  notifications = []
}: Partial<DashboardLayoutProperties>): DashboardLayoutProperties => ({
  user,
  notifications
})

vi.mock('~/features/notifications/components/notifications-list', () => ({
  NotificationsListComponent: ({ open }: { open: boolean }) => (
    <>{open && <h3>Notifications List</h3>}</>
  )
}))

describe('Dashboard Layout Component', () => {
  test('should return the dashboard layout component', () => {
    const path = '/dashboard'
    const properties = createProperties({})

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('banner', { name: /techBusters/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: /techBusters/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument()

    expect(screen.getByRole('main')).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /open sidebar/i })
    ).toBeInTheDocument()
  })

  test('given some unread notifications: should render the notification count', async () => {
    const path = '/dashboard/content'
    const properties = createProperties({
      notifications: [createPopulatedNotification({ read: false })]
    })

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByLabelText(/notifications count/i)).toBeInTheDocument()

    expect(screen.getByLabelText(/notifications count/i)).toHaveTextContent('1')
  })

  test('given 10 unread notifications: should render the notification count 9+', async () => {
    const path = '/dashboard/content'
    const properties = createProperties({
      notifications: Array.from({ length: 10 })
        .fill(0)
        .map(() => createPopulatedNotification({ read: false }))
    })

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByLabelText(/notifications count/i)).toBeInTheDocument()

    expect(screen.getByLabelText(/notifications count/i)).toHaveTextContent(
      '9+'
    )
  })

  test('clicking on the open sidebar button: should open the sidebar', async () => {
    const path = '/dashboard/content'
    const properties = createProperties({})

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const sidebarButton = screen.getByRole('button', { name: /open sidebar/i })

    await act(async () => {
      sidebarButton.click()
    })

    expect(
      screen.getByRole('dialog', { name: /mobile sidebar/i })
    ).toBeInTheDocument()
  })

  test('clicking on the notification button: should open the notifications', async () => {
    const path = '/dashboard/content'
    const properties = createProperties({})

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.queryByRole('heading', { name: /notifications list/i })
    ).not.toBeInTheDocument()

    const notificationsButton = screen.getByRole('button', {
      name: /notifications/i
    })

    await act(async () => {
      notificationsButton.click()
    })

    expect(
      screen.queryByRole('heading', { name: /notifications list/i })
    ).toBeInTheDocument()
  })

  test('clicking on the user button: should open the user menu', async () => {
    const path = '/dashboard/content'
    const properties = createProperties({})

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const userButton = screen.getByRole('button', { name: /your profile/i })

    await act(async () => {
      userButton.click()
    })

    expect(
      screen.getByRole('menuitem', { name: /account/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: /logout/i })
    ).toBeInTheDocument()
  })

  test('given the projects path: should render the correct page title', () => {
    const path = '/projects'
    const properties = createProperties({})

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { name: /projects/i })
    ).toBeInTheDocument()
  })

  test('given the create project path: should render the correct page title', () => {
    const path = '/projects/create'
    const properties = createProperties({})

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { name: /create project/i })
    ).toBeInTheDocument()
  })

  test('given the project details path: should render the correct page title', () => {
    const path = '/projects/my-project'
    const properties = createProperties({})

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { name: /project/i })
    ).toBeInTheDocument()
  })

  test('given the create scan path: should render the correct page title', () => {
    const path = '/projects/my-project/scans/create'
    const properties = createProperties({})

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { name: /create scan/i })
    ).toBeInTheDocument()
  })

  test('given the scan details path: should render the correct page title', () => {
    const path = '/projects/my-project/scans/my-scan'
    const properties = createProperties({})

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByRole('heading', { name: /scan/i })).toBeInTheDocument()
  })

  test('given the settings path: should render the correct page title', () => {
    const path = '/settings'
    const properties = createProperties({})

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardLayoutComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { name: /settings/i })
    ).toBeInTheDocument()
  })
})
