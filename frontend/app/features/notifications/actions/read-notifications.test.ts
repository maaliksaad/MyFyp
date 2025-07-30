import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { readNotificationsAction } from '~/features/notifications/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedNotification } from '~/test/factories'
import {
  createAuthenticatedRequest,
  toFormData
} from '~/test/server-test-utils'

describe('Read Notifications Action', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request('http://localhost:3000/notifications')

    const response = (await readNotificationsAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error while reading notifications: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/notifications',
      formData: toFormData({
        name: faker.lorem.words(1),
        thumbnail_id: faker.number.int().toString()
      })
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      errors: {
        message: 'Error while reading the notifications'
      }
    })

    const response = (await readNotificationsAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/notifications',
      formData: toFormData({
        name: faker.lorem.words(1),
        thumbnail_id: faker.number.int().toString()
      })
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {}
    })

    const response = (await readNotificationsAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a logged in user and a location: should redirect to location', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/create',
      formData: toFormData({
        location: '/dashboard'
      })
    })

    const notifications = createPopulatedNotification()

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        read_notifications: [notifications]
      }
    })

    const response = (await readNotificationsAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(`/dashboard`)
  })

  test('given a logged in user and no location: should redirect to /', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/create',
      formData: toFormData({})
    })

    const notifications = createPopulatedNotification()

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        read_notifications: [notifications]
      }
    })

    const response = (await readNotificationsAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(`/`)
  })
})
