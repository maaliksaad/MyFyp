import { describe, expect, test, vi } from 'vitest'

import { getProjectLoader } from '~/features/projects/loaders'
import { type Activity, type Project } from '~/graphql'
import * as client from '~/graphql/client.server'
import {
  createPopulatedActivity,
  createPopulatedProject
} from '~/test/factories'
import { createAuthenticatedRequest } from '~/test/server-test-utils'

describe('Get Project loaders', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request('http://localhost:3000/projects/project-1')

    const response = (await getProjectLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error while retrieving project: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/project-1'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      errors: {
        message: 'Error while retrieving the project'
      }
    })

    const response = (await getProjectLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/project-1'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      data: {}
    })

    const response = (await getProjectLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a logged in user: should return the projects', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/project-1'
    })

    const project = createPopulatedProject()
    const activity = createPopulatedActivity()

    vi.spyOn(client, 'query').mockResolvedValue({
      data: {
        project,
        activities: [activity]
      }
    })

    const response = (await getProjectLoader({
      request,
      context: {},
      params: {}
    })) as Response

    const body = (await response.json()) as {
      project: Project
      activities: Activity[]
    }

    expect(response.status).toBe(200)
    expect(body.project).toMatchObject(project)
    expect(body.activities).toMatchObject([activity])
  })
})
