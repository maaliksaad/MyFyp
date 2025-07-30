import { describe, expect, test, vi } from 'vitest'

import { getProjectsLoader } from '~/features/projects/loaders'
import { type Project } from '~/graphql'
import * as client from '~/graphql/client.server'
import { createPopulatedProject } from '~/test/factories'
import { createAuthenticatedRequest } from '~/test/server-test-utils'

describe('Get Projects loaders', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request('http://localhost:3000/projects')

    const response = (await getProjectsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error while retrieving projects: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      errors: {
        message: 'Error while retrieving the projects'
      }
    })

    const response = (await getProjectsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      data: {}
    })

    const response = (await getProjectsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a logged in user: should return the projects', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects'
    })

    const project = createPopulatedProject()

    vi.spyOn(client, 'query').mockResolvedValue({
      data: {
        projects: [project]
      }
    })

    const response = (await getProjectsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    const body = (await response.json()) as { projects: Project[] }

    expect(response.status).toBe(200)
    expect(body.projects).toMatchObject([project])
  })
})
