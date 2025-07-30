import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { updateAccountAction } from '~/features/settings/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedUser } from '~/test/factories'
import {
  createAuthenticatedRequest,
  toFormData
} from '~/test/server-test-utils'

describe('Update Account action', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request('http://localhost:3000/settings/account')

    const response = (await updateAccountAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error while updating the password: should return a 400 status', async () => {
    const formData = toFormData({
      name: faker.lorem.words(1),
      picture: faker.image.url()
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/settings/account',
      formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      errors: {
        message: 'Unexpected Error'
      }
    })

    const response = (await updateAccountAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const formData = toFormData({
      name: faker.lorem.words(1),
      picture: faker.image.url()
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/settings/account',
      formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {}
    })

    const response = (await updateAccountAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a valid input: should redirect to the /settings/account', async () => {
    const formData = toFormData({
      name: faker.lorem.words(1),
      picture: faker.image.url()
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/settings/account',
      formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        update_account: createPopulatedUser()
      }
    })

    const response = (await updateAccountAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/settings/account')
  })
})
