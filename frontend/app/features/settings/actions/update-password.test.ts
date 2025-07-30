import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { updatePasswordAction } from '~/features/settings/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedUser } from '~/test/factories'
import {
  createAuthenticatedRequest,
  toFormData
} from '~/test/server-test-utils'

describe('Update Password action', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request('http://localhost:3000/settings/password')

    const response = (await updatePasswordAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given same current and new passwords: should return a 400 status', async () => {
    const password = faker.internet.password()

    const formData = toFormData({
      current_password: password,
      new_password: password,
      confirm_password: faker.internet.password()
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/settings/password',
      formData
    })

    const response = (await updatePasswordAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      errors: {
        new_password: 'New password must be different'
      }
    })
  })

  test('given different new and confirm passwords: should return a 400 status', async () => {
    const password = faker.internet.password()

    const formData = toFormData({
      current_password: faker.internet.password(),
      new_password: password,
      confirm_password: `${password}${password}`
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/settings/password',
      formData
    })

    const response = (await updatePasswordAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      errors: {
        confirm_password: 'Passwords do not match'
      }
    })
  })

  test('given an error while updating the password: should return a 400 status', async () => {
    const password1 = faker.internet.password()
    const password2 = `password${faker.internet.password()}`

    const formData = toFormData({
      current_password: password1,
      new_password: password2,
      confirm_password: password2
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/settings/password',
      formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      errors: {
        message: 'Unexpected Error'
      }
    })

    const response = (await updatePasswordAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const password1 = faker.internet.password()
    const password2 = `password${faker.internet.password()}`

    const formData = toFormData({
      current_password: password1,
      new_password: password2,
      confirm_password: password2
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/settings/password',
      formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {}
    })

    const response = (await updatePasswordAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a valid input: should redirect to the /settings/password', async () => {
    const password1 = faker.internet.password()
    const password2 = `password${faker.internet.password()}`

    const formData = toFormData({
      current_password: password1,
      new_password: password2,
      confirm_password: password2
    })

    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/settings/password',
      formData
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        update_password: createPopulatedUser()
      }
    })

    const response = (await updatePasswordAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/settings/password')
  })
})
