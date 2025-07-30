import { json, type LoaderFunction, redirect } from '@remix-run/node'

import { retrieveUserFromSession } from '~/features/user-authentication/session'
import { type Notification, query, type User } from '~/graphql'
import { NOTIFICATIONS_QUERY } from '~/graphql/queries'

export const getNotificationsLoader: LoaderFunction = async ({ request }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  const response = await query<{
    notifications: Notification[]
    verify_token: User
  }>({
    query: NOTIFICATIONS_QUERY,
    headers: {
      Authorization: `Bearer ${user?.token}`
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (
    response.data?.notifications == null ||
    response.data?.verify_token == null
  ) {
    return json({ errors: { message: 'Unexpected Error' } }, { status: 400 })
  }

  return json({
    notifications: response.data.notifications,
    user: response.data.verify_token
  })
}
