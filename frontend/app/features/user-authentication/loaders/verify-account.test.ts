import { faker } from '@faker-js/faker'
import { describe, expect, test } from 'vitest'

import { verifyAccountLoader } from '~/features/user-authentication/loaders'

describe('Verify Account loaders', () => {
  test('given invalid id or token: should redirect to /login', async () => {
    const request = new Request('http://localhost:3000/verify-account')

    const response = (await verifyAccountLoader({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given valid id and token: should return parameters', async () => {
    const id = faker.number.int().toString()
    const token = faker.string.alpha(10)

    const request = new Request(
      `http://localhost:3000/verify-account?id=${id}&token=${token}`
    )

    const response = (await verifyAccountLoader({
      request,
      context: {},
      params: {}
    })) as Response

    const body = await response.json()

    expect(body).toMatchObject({ id, token })
  })
})
