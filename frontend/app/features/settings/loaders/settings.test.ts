import { describe, expect, test } from 'vitest'

import { settingsLoader } from '~/features/settings/loaders'
import { createPopulatedUser } from '~/test/factories'
import { createAuthenticatedRequest } from '~/test/server-test-utils'

describe('Settings loaders', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request('http://localhost:3000/settings')

    const response = (await settingsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given a logged in user: should return the user and images', async () => {
    const user = createPopulatedUser()

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/settings',
      user
    })

    const response = (await settingsLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      images: expect.any(Array),
      user
    })
  })
})
