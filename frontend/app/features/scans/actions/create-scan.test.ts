import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { createScanAction } from '~/features/scans/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedScan } from '~/test/factories'
import {
  createAuthenticatedRequest,
  toFormData
} from '~/test/server-test-utils'

describe('Create Scan action', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request(
      'http://localhost:3000/projects/my-project/scans/create'
    )

    const response = (await createScanAction({
      request,
      context: {},
      params: {
        projectSlug: 'my-project'
      }
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error while creating the scan: should return a 400 status', async () => {
    const formData = toFormData({
      name: faker.lorem.words(1),
      input_file_id: faker.number.int().toString()
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/my-project/scans/create',
      formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      errors: {
        message: 'Unexpected Error'
      }
    })

    const response = (await createScanAction({
      request,
      context: {},
      params: {
        projectSlug: 'my-project'
      }
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const formData = toFormData({
      name: faker.lorem.words(1),
      input_file_id: faker.number.int().toString()
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/my-project/scans/create',
      formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {}
    })

    const response = (await createScanAction({
      request,
      context: {},
      params: {
        projectSlug: 'my-project'
      }
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a valid input: should redirect to the /scans', async () => {
    const formData = toFormData({
      name: faker.lorem.words(1),
      input_file_id: faker.number.int().toString()
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/my-project/scans/create',
      formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        create_scan: createPopulatedScan()
      }
    })

    const response = (await createScanAction({
      request,
      context: {},
      params: {
        projectSlug: 'my-project'
      }
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/projects/my-project')
  })
})
