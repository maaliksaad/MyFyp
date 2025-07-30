import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { verifyAccountAction } from '~/features/user-authentication/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedUser } from '~/test/factories'
import { toFormData } from '~/test/server-test-utils'

describe('Verify Account action', () => {
  test('given a valid input: should return a redirect to /dashboard', async () => {
    const formData = toFormData({
      id: faker.number.int().toString(),
      token: faker.string.alpha(32)
    })

    const request = new Request('http://localhost:3000/verify-account', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        verify_account: {
          ...createPopulatedUser()
        }
      }
    })

    const response = (await verifyAccountAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/dashboard')
  })

  test('given an invalid input: should return a response with a 400 status', async () => {
    const formData = toFormData({
      id: faker.number.int().toString(),
      token: faker.string.alpha(32)
    })

    const request = new Request('http://localhost:3000/verify-account', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      errors: {
        message: 'Invalid token'
      }
    })

    const response = (await verifyAccountAction({
      request,
      context: {},
      params: {}
    })) as Response

    const responseBody = await response.json()

    expect(response.status).toBe(400)
    expect(responseBody.errors).toEqual({
      message: 'Invalid token'
    })
  })

  test('given a valid input but no data from server: should return a 400 status', async () => {
    const formData = toFormData({
      id: faker.number.int().toString(),
      token: faker.string.alpha(32)
    })

    const request = new Request('http://localhost:3000/verify-account', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: null
    })

    const response = (await verifyAccountAction({
      request,
      context: {},
      params: {}
    })) as Response

    const responseBody = await response.json()

    expect(response.status).toBe(400)
    expect(responseBody.errors).toEqual({
      message: 'Account verification link is invalid'
    })
  })
})
