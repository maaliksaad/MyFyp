import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import {
  ProjectDetailsComponent,
  type ProjectDetailsProperties
} from '~/features/projects/components/project-details'
import { Entity } from '~/graphql'
import {
  createPopulatedActivity,
  createPopulatedProject
} from '~/test/factories'
import { act, createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  state = faker.helpers.arrayElement(['idle', 'submitting']),
  project = createPopulatedProject(),
  activities = Array.from({ length: 5 }, () =>
    createPopulatedActivity({
      entity: Entity.Project
    })
  )
}: Partial<ProjectDetailsProperties> = {}): ProjectDetailsProperties => ({
  state,
  activities,
  project
})

describe('Project Details Component', () => {
  test('given an idle state: should render the component', () => {
    const path = '/projects'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ProjectDetailsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { name: properties.project.name })
    ).toBeInTheDocument()

    expect(screen.getByAltText(properties.project.name)).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute(
      'href',
      `/projects/${properties.project.slug}/edit`
    )

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: /scans/i })).toBeInTheDocument()

    properties.project.scans.forEach(scan => {
      expect(
        screen.getByRole('heading', { name: scan.name })
      ).toBeInTheDocument()

      expect(screen.getByRole('link', { name: scan.name })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: scan.name })).toHaveAttribute(
        'href',
        `/projects/${properties.project.slug}/scans/${scan.slug}`
      )
    })

    expect(
      screen.getByRole('link', { name: /create scan/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create scan/i })).toHaveAttribute(
      'href',
      `/projects/${properties.project.slug}/scans/create`
    )

    expect(
      screen.getByRole('heading', { name: /summary/i })
    ).toBeInTheDocument()
    expect(
      screen.getByAltText(properties.project.user.name)
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: /activity/i })
    ).toBeInTheDocument()
  })

  test('clicking the delete button: should open the delete project modal', async () => {
    const path = '/projects'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ProjectDetailsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })

    expect(deleteButton).toBeInTheDocument()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await act(async () => {
      deleteButton.click()
    })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('given a submitting state: should render the component', async () => {
    const path = '/projects'
    const properties = createProperties({
      state: 'submitting'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ProjectDetailsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })

    await act(async () => {
      deleteButton.click()
    })

    expect(
      screen.getByRole('button', { name: /deleting/i })
    ).toBeInTheDocument()
  })
})
