import { describe, expect, test, vi } from 'vitest'

import { getNotificationsLoader } from '~/features/notifications/loaders'
import { type User } from '~/graphql'
import * as client from '~/graphql/client.server'
import {
  createPopulatedNotification,
  createPopulatedUser
} from '~/test/factories'
import { createAuthenticatedRequest } from '~/test/server-test-utils'

describe('Get Notifications loaders', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request('http://localhost:3000/notifications')

    const response = (await getNotificationsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error while retrieving notifications: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/notifications'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      errors: {
        message: 'Error while retrieving the notifications'
      }
    })

    const response = (await getNotificationsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/notifications'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      data: {}
    })

    const response = (await getNotificationsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a logged in user: should return the notifications and user', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/notifications'
    })

    const notification = createPopulatedNotification()
    const user = createPopulatedUser()

    vi.spyOn(client, 'query').mockResolvedValue({
      data: {
        notifications: [notification],
        verify_token: user
      }
    })

    const response = (await getNotificationsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    const body = (await response.json()) as {
      notifications: Notification[]
      user: User
    }

    expect(response.status).toBe(200)
    expect(body.notifications).toMatchObject([notification])
    expect(body.user).toMatchObject(user)
  })
})
