import { faker } from '@faker-js/faker'
import { readFileSync } from 'fs'

import { createCookieForUserSession } from '~/features/user-authentication/session'
import { type User } from '~/graphql'
import { createPopulatedUser } from '~/test/factories/user.factory'

export async function createAuthenticatedRequest({
  url,
  formData,
  method = 'POST',
  user
}: {
  formData?: FormData
  url: string
  method?: 'POST' | 'GET' | 'DELETE' | 'PUT'
  user?: User
}) {
  const request = new Request(url, { method, body: formData })
  request.headers.set(
    'Cookie',
    await createCookieForUserSession({
      request,
      user: {
        ...(user ?? createPopulatedUser()),
        token: faker.string.alpha(32),
        __typename: 'UserWithToken'
      },
      remember: true
    })
  )

  return request
}

export const createTestFile = ({
  filename = 'test-image.png',
  contentType = 'image/png'
}: {
  filename?: string
  contentType?: string
} = {}) =>
  new File([readFileSync(`playwright/fixtures/${filename}`)], filename, {
    type: contentType
  })

type Payload = Record<string, string | File | string[]>

export function toFormData(payload: Payload) {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => {
        formData.append(key, item)
      })
    } else {
      formData.append(key, value)
    }
  })

  return formData
}
