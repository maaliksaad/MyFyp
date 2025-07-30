import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import {
  DashboardComponent,
  type DashboardProperties
} from '~/features/dashboard/components/dashboard'
import { Entity } from '~/graphql'
import {
  createPopulatedActivity,
  createPopulatedProject
} from '~/test/factories'
import { createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  stats = [
    {
      name: faker.lorem.word(),
      value: faker.lorem.word()
    },
    {
      name: faker.lorem.word(),
      value: faker.lorem.word()
    },
    {
      name: faker.lorem.word(),
      value: faker.lorem.word()
    },
    {
      name: faker.lorem.word(),
      value: faker.lorem.word()
    }
  ],
  activities = [
    createPopulatedActivity({ entity: Entity.Project }),
    createPopulatedActivity({ entity: Entity.Scan })
  ],
  projects = [createPopulatedProject()]
}: Partial<DashboardProperties>): DashboardProperties => ({
  stats,
  activities,
  projects
})

describe('Dashboard Component', () => {
  test('should return the dashboard layout component', () => {
    const path = '/dashboard/content'
    const properties = createProperties({})

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <DashboardComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { level: 2, name: /recent activity/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { level: 2, name: /recent projects/i })
    ).toBeInTheDocument()
  })
})
