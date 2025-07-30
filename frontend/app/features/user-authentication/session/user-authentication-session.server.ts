import { createCookieSessionStorage, redirect } from '@remix-run/node'
import invariant from 'tiny-invariant'

import { type UserWithToken } from '~/graphql'

const { SESSION_SECRET, NODE_ENV } = process.env

invariant(SESSION_SECRET, 'SESSION_SECRET must be set')

export const USER_AUTHENTICATION_SESSION_NAME =
  'techBusters__user-authentication-session'

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: USER_AUTHENTICATION_SESSION_NAME,
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secrets: [SESSION_SECRET],
    secure: NODE_ENV === 'production'
  }
})

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie')
  return await sessionStorage.getSession(cookie)
}

export async function createCookieForUserSession({
  request,
  user,
  remember
}: {
  request: Request
  user: UserWithToken
  remember: boolean
}) {
  const session = await getSession(request)

  session.set('user', user)

  return await sessionStorage.commitSession(session, {
    maxAge: remember ? 60 * 60 * 24 * 365 : undefined
  })
}

export async function createUserSession({
  request,
  user,
  remember,
  redirectTo
}: {
  request: Request
  user: UserWithToken
  remember: boolean
  redirectTo: string
}) {
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await createCookieForUserSession({
        request,
        user,
        remember
      })
    }
  })
}

export async function retrieveUserFromSession(
  request: Request
): Promise<UserWithToken | null> {
  const session = await getSession(request)

  return session.get('user')
}

export async function logout(request: Request) {
  const session = await getSession(request)

  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session)
    }
  })
}
