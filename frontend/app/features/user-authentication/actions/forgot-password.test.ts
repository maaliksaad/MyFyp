import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { forgotPasswordAction } from '~/features/user-authentication/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedUser } from '~/test/factories'
import { toFormData } from '~/test/server-test-utils'

describe('Forgot Password action', () => {
  test('given a valid input: should return success and values', async () => {
    const formData = toFormData({
      email: faker.internet.email()
    })

    const request = new Request('http://localhost:3000/reset-password', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        forgot_password: {
          ...createPopulatedUser()
        }
      }
    })

    const response = (await forgotPasswordAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      success: true,
      values: {
        email: formData.get('email')
      }
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
        message: 'Invalid email'
      }
    })

    const response = (await forgotPasswordAction({
      request,
      context: {},
      params: {}
    })) as Response

    const responseBody = await response.json()

    expect(response.status).toBe(400)
    expect(responseBody.errors).toEqual({
      message: 'Invalid email'
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

    const response = (await forgotPasswordAction({
      request,
      context: {},
      params: {}
    })) as Response

    const responseBody = await response.json()

    expect(response.status).toBe(400)
    expect(responseBody.errors).toEqual({
      message: 'Unexpected Error'
    })
  })
})
