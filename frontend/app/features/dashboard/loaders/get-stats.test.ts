import { describe, expect, test, vi } from 'vitest'

import { getStatsLoader } from '~/features/dashboard/loaders'
import * as client from '~/graphql/client.server'
import {
  createPopulatedActivity,
  createPopulatedProject,
  createPopulatedScan
} from '~/test/factories'
import { createAuthenticatedRequest } from '~/test/server-test-utils'

describe('Get Stats loaders', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request('http://localhost:3000/dashboard')

    const response = (await getStatsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error while retrieving the stats: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/dashboard'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      errors: {
        message: 'Error while retrieving the scan'
      }
    })

    const response = (await getStatsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/dashboard'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      data: {}
    })

    const response = (await getStatsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a logged in user: should return the scan', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/dashboard'
    })

    const scan = createPopulatedScan()
    const project = createPopulatedProject()
    const activity = createPopulatedActivity()

    vi.spyOn(client, 'query').mockResolvedValue({
      data: {
        stats: [],
        projects: [project],
        recent_projects: [project],
        scans: [scan],
        activities: [activity]
      }
    })

    const response = (await getStatsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.projects).toMatchObject([project])
    expect(body.activities).toMatchObject([activity])
  })
})
