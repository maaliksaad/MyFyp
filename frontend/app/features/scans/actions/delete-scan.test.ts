import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { deleteScanAction } from '~/features/scans/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedScan } from '~/test/factories'
import {
  createAuthenticatedRequest,
  toFormData
} from '~/test/server-test-utils'

describe('Delete Scan Action', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request(
      'http://localhost:3000/projects/my-project/scans/my-scan/delete'
    )

    const response = (await deleteScanAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error while deleting scan: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/my-project/scans/my-scan/delete',
      formData: toFormData({
        scan_id: faker.number.int().toString()
      })
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      errors: {
        message: 'Error while retrieving the scan'
      }
    })

    const response = (await deleteScanAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/my-project/scans/my-scan/delete',
      formData: toFormData({
        scan_id: faker.number.int().toString()
      })
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {}
    })

    const response = (await deleteScanAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a logged in user: should redirect to /projects/:slug', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/my-project/scans/my-scan/delete',
      formData: toFormData({
        scan_id: faker.number.int({ min: 1, max: 1000 }).toString()
      })
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        delete_scan: createPopulatedScan()
      }
    })

    const response = (await deleteScanAction({
      request,
      context: {},
      params: {
        projectSlug: 'my-project'
      }
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(`/projects/my-project`)
  })
})
