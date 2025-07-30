import { describe, expect, test, vi } from 'vitest'

import { verifyTokenLoader } from '~/features/user-authentication/loaders'
import * as client from '~/graphql/client.server'
import { createPopulatedUser } from '~/test/factories'
import { createAuthenticatedRequest } from '~/test/server-test-utils'

describe('Dashboard loaders', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request('http://localhost:3000/scans')

    const response = (await verifyTokenLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error from server: should redirect to the /login', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/scans'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      errors: { message: 'Error' }
    })

    const response = (await verifyTokenLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given no data from server: should redirect to the /login', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/scans'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      data: null
    })

    const response = (await verifyTokenLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given a logged in user: should return the user data', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/scans'
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      data: {
        verify_token: createPopulatedUser()
      }
    })

    const response = (await verifyTokenLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(200)
  })

  test('given an un-boarded user: should redirect to the /onboarding', async () => {
    const user = createPopulatedUser({
      picture:
        'https://ui-avatars.com/api/?background=4f46e5&color=fff&name=Davis'
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/scans',
      user
    })

    vi.spyOn(client, 'query').mockResolvedValue({
      data: {
        verify_token: user
      }
    })

    const response = (await verifyTokenLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/onboarding')
  })
})
