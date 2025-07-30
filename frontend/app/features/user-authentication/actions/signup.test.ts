import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { signupAction } from '~/features/user-authentication/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedUser } from '~/test/factories'
import { toFormData } from '~/test/server-test-utils'

describe('Signup action', () => {
  test('given a valid input: should return success true', async () => {
    const formData = toFormData({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    })

    const request = new Request('http://localhost:3000/signup', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        signup: {
          ...createPopulatedUser(),
          token: faker.string.alpha(32)
        }
      }
    })

    const response = (await signupAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      success: true
    })
  })

  test('given an invalid input: should return a response with a 400 status', async () => {
    const formData = toFormData({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    })

    const request = new Request('http://localhost:3000/signup', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      errors: {
        message: 'User with this email already exists'
      }
    })

    const response = (await signupAction({
      request,
      context: {},
      params: {}
    })) as Response

    const responseBody = await response.json()

    expect(response.status).toBe(400)
    expect(responseBody.errors).toEqual({
      message: 'User with this email already exists'
    })
    expect(responseBody.values.email).toEqual(formData.get('email'))
  })

  test('given a valid input but no data from server: should return a 400 status', async () => {
    const formData = toFormData({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    })

    const request = new Request('http://localhost:3000/signup', {
      method: 'POST',
      body: formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: null
    })

    const response = (await signupAction({
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
