import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { loginAction } from '~/features/user-authentication/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedUser } from '~/test/factories'
import { toFormData } from '~/test/server-test-utils'

describe('Login action', () => {
  test('given a valid input: should redirect to the /dashboard', async () => {
    const formData = toFormData({
      email: faker.internet.email(),
      password: faker.internet.password()
    })

    const request = new Request('http://localhost:3000/login', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        login: {
          ...createPopulatedUser(),
          token: faker.string.alpha(32)
        }
      }
    })

    const response = (await loginAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/dashboard')
  })

  test('given an invalid input: should return a response with a 400 status', async () => {
    const formData = toFormData({
      email: faker.internet.email(),
      password: faker.internet.password()
    })

    const request = new Request('http://localhost:3000/login', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      errors: {
        message: 'Unexpected error'
      }
    })

    const response = (await loginAction({
      request,
      context: {},
      params: {}
    })) as Response

    const responseBody = await response.json()

    expect(response.status).toBe(400)
    expect(responseBody.errors).toEqual({
      message: 'Unexpected error'
    })
    expect(responseBody.values.email).toEqual(formData.get('email'))
  })

  test('given a valid input but no data from server: should return a 400 status', async () => {
    const formData = toFormData({
      email: faker.internet.email(),
      password: faker.internet.password()
    })

    const request = new Request('http://localhost:3000/login', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: null
    })

    const response = (await loginAction({
      request,
      context: {},
      params: {}
    })) as Response

    const responseBody = await response.json()

    expect(response.status).toBe(400)
    expect(responseBody.errors).toEqual({
      message: 'Unexpected Error'
    })
    expect(responseBody.values.email).toEqual(formData.get('email'))
  })
})
