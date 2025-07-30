import { json, type LoaderFunction, redirect } from '@remix-run/node'

import {
  logout,
  retrieveUserFromSession
} from '~/features/user-authentication/session'
import { query, type User } from '~/graphql'
import { VERIFY_TOKEN_QUERY } from '~/graphql/queries'

export const verifyTokenLoader: LoaderFunction = async ({ request }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  const response = await query<{ verify_token: User }>({
    query: VERIFY_TOKEN_QUERY,
    headers: {
      Authorization: `Bearer ${user?.token}`
    }
  })

  if (response.errors != null) {
    return await logout(request)
  }

  if (response.data == null) {
    return await logout(request)
  }

  if (user.picture.includes('ui-avatars.com')) {
    return redirect('/onboarding')
  }

  return json({ user })
}
