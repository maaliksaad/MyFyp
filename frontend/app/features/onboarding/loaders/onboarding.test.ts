import { describe, expect, test } from 'vitest'

import { onboardingLoader } from '~/features/onboarding/loaders'
import { createPopulatedUser } from '~/test/factories'
import { createAuthenticatedRequest } from '~/test/server-test-utils'

describe('Onboarding loaders', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request('http://localhost:3000/onboarding')

    const response = (await onboardingLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an onboarded user: should redirect to the /dashboard', async () => {
    const user = createPopulatedUser()

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/onboarding',
      user
    })

    const response = (await onboardingLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/dashboard')
  })

  test('given an un-boarded user: should return the data', async () => {
    const user = createPopulatedUser({
      picture:
        'https://ui-avatars.com/api/?background=4f46e5&color=fff&name=Davis'
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/onboarding',
      user
    })

    const response = (await onboardingLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      images: expect.any(Array),
      platforms: expect.any(Array)
    })
  })
})
