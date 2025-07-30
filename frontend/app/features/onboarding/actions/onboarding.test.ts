import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { onboardingAction } from '~/features/onboarding/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedUser } from '~/test/factories'
import {
  createAuthenticatedRequest,
  toFormData
} from '~/test/server-test-utils'

describe('Onboarding action', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request('http://localhost:3000/onboarding')

    const response = (await onboardingAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error while creating the scan: should return a 400 status', async () => {
    const formData = toFormData({
      picture: faker.image.avatar()
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/onboarding',
      formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      errors: {
        message: 'Unexpected Error'
      }
    })

    const response = (await onboardingAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const formData = toFormData({
      picture: faker.image.avatar()
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/onboarding',
      formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {}
    })

    const response = (await onboardingAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a valid input: should redirect to the /dashboard', async () => {
    const user = createPopulatedUser()

    const formData = toFormData({
      picture: faker.image.avatar()
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/onboarding',
      formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        update_account: user
      }
    })

    const response = (await onboardingAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/dashboard')
  })
})
