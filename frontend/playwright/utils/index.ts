import { faker } from '@faker-js/faker'
import type { Page } from '@playwright/test'
import { parse } from 'cookie'

import {
  createCookieForUserSession,
  USER_AUTHENTICATION_SESSION_NAME
} from '~/features/user-authentication/session'
import { type User } from '~/graphql'
import { createPopulatedUser } from '~/test/factories'

export async function loginByCookie({
  user = createPopulatedUser(),
  page,
  baseURL = 'http://localhost:3000'
}: {
  user?: User
  page: Page
  baseURL?: string
}) {
  const cookieValue = await createCookieForUserSession({
    request: new Request(`${baseURL}/`),
    remember: false,
    user: {
      ...user,
      token: faker.string.alphanumeric(32),
      __typename: 'UserWithToken'
    }
  })
  const parsedCookie = parse(cookieValue)
  const token = parsedCookie[USER_AUTHENTICATION_SESSION_NAME]

  await page.context().addCookies([
    {
      name: USER_AUTHENTICATION_SESSION_NAME,
      value: token,
      domain: 'localhost',
      path: '/'
    }
  ])

  return user
}
