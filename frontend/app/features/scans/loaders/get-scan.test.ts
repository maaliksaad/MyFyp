import { describe, expect, test, vi } from 'vitest'

import { getScanLoader } from '~/features/scans/loaders'
import * as client from '~/graphql/client.server'
import {
  createPopulatedActivity,
  createPopulatedProject,
  createPopulatedScan
} from '~/test/factories'
import { createAuthenticatedRequest } from '~/test/server-test-utils'

describe('Get Scan loaders', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request(
      'http://localhost:3000/projects/my-project/scans/my-scan'
    )

    const response = (await getScanLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error while retrieving the scan: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/my-project/scans/my-scan'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      errors: {
        message: 'Error while retrieving the scan'
      }
    })

    const response = (await getScanLoader({
      request,
      context: {},
      params: {
        scanSlug: 'my-scan',
        projectSlug: 'my-project'
      }
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/my-project/scans/my-scan'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      data: {}
    })

    const response = (await getScanLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a logged in user: should return the scan', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/my-project/scans/my-scan'
    })

    const scan = createPopulatedScan()
    const project = createPopulatedProject()
    const activity = createPopulatedActivity()

    vi.spyOn(client, 'query').mockResolvedValue({
      data: {
        scan,
        project,
        activities: [activity]
      }
    })

    const response = (await getScanLoader({
      request,
      context: {},
      params: {
        scanSlug: 'my-scan',
        projectSlug: 'my-project'
      }
    })) as Response

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.scan).toMatchObject(scan)
    expect(body.project).toMatchObject(project)
    expect(body.activities).toMatchObject([activity])
  })
})
