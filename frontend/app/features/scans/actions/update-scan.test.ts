import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { updateScanAction } from '~/features/scans/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedScan } from '~/test/factories'
import {
  createAuthenticatedRequest,
  toFormData
} from '~/test/server-test-utils'

describe('Update Scan Action', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request(
      'http://localhost:3000/projects/my-project/scans/my-scan/edit'
    )

    const response = (await updateScanAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error while updating scan: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/my-project/scans/my-scan/edit',
      formData: toFormData({
        name: faker.lorem.words(1),
        scan_id: faker.number.int().toString()
      })
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      errors: {
        message: 'Error while retrieving the projects'
      }
    })

    const response = (await updateScanAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/my-project/scans/my-scan/edit',
      formData: toFormData({
        name: faker.lorem.words(1),
        scan_id: faker.number.int().toString()
      })
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {}
    })

    const response = (await updateScanAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a logged in user: should redirect to /projects', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/my-project/scans/my-scan/edit',
      formData: toFormData({
        name: faker.lorem.words(1),
        scan_id: faker.number.int({ min: 1, max: 1000 }).toString()
      })
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        update_scan: createPopulatedScan()
      }
    })

    const response = (await updateScanAction({
      request,
      context: {},
      params: {
        projectSlug: 'my-project',
        scanSlug: 'my-scan'
      }
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(
      `/projects/my-project/scans/my-scan`
    )
  })
})
