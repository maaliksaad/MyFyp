import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { resetPasswordAction } from '~/features/user-authentication/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedUser } from '~/test/factories'
import { toFormData } from '~/test/server-test-utils'

describe('Reset Password action', () => {
  test('given a valid input: should return a redirect to /login', async () => {
    const password = faker.internet.password()

    const formData = toFormData({
      id: faker.number.int().toString(),
      token: faker.string.alpha(32),
      password,
      confirmPassword: password
    })

    const request = new Request('http://localhost:3000/reset-password', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        reset_password: {
          ...createPopulatedUser()
        }
      }
    })

    const response = (await resetPasswordAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given different passwords: should return a response with a 400 status', async () => {
    const formData = toFormData({
      id: faker.number.int().toString(),
      token: faker.string.alpha(32),
      password: faker.internet.password(),
      confirmPassword: faker.internet.password()
    })

    const request = new Request('http://localhost:3000/reset-password', {
      method: 'POST',
      body: formData
    })

    const response = (await resetPasswordAction({
      request,
      context: {},
      params: {}
    })) as Response

    const responseBody = await response.json()

    expect(response.status).toBe(400)
    expect(responseBody.errors).toEqual({
      confirmPassword: 'Passwords do not match'
    })
  })

  test('given an invalid input: should return a response with a 400 status', async () => {
    const formData = toFormData({
      id: faker.number.int().toString(),
      token: faker.string.alpha(32)
    })

    const request = new Request('http://localhost:3000/reset-password', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      errors: {
        message: 'Invalid token'
      }
    })

    const response = (await resetPasswordAction({
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

    const request = new Request('http://localhost:3000/reset-password', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: null
    })

    const response = (await resetPasswordAction({
      request,
      context: {},
      params: {}
    })) as Response

    const responseBody = await response.json()

    expect(response.status).toBe(400)
    expect(responseBody.errors).toEqual({
      message: 'Password reset link is invalid'
    })
  })
})
