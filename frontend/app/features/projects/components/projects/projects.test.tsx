import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import {
  ProjectsComponent,
  type ProjectsProperties
} from '~/features/projects/components/projects'
import { createPopulatedProject } from '~/test/factories'
import { createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  projects = Array.from(
    { length: faker.number.int({ min: 1, max: 3 }) },
    (_, index) =>
      createPopulatedProject({
        project_id: index + 1
      })
  )
}: Partial<ProjectsProperties>): ProjectsProperties => ({
  projects
})

describe('Projects Component', () => {
  test('given an empty list of projects: should render the create project message', () => {
    const path = '/projects'
    const properties = createProperties({
      projects: []
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ProjectsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { name: /create project/i, level: 2 })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: /create project/i })
    ).toBeInTheDocument()
  })

  test('given a list of projects: should render the projects', () => {
    const path = '/projects'
    const properties = createProperties({})

    const RemixStub = createRemixStub([
      { path, Component: () => <ProjectsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    properties.projects.forEach(project => {
      expect(
        screen.getByRole('heading', { name: project.name })
      ).toBeInTheDocument()

      expect(screen.getByAltText(project.name)).toBeInTheDocument()
    })
  })
})
