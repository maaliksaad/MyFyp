import { type ActionFunction, json, redirect } from '@remix-run/node'

import { retrieveUserFromSession } from '~/features/user-authentication/session'
import { mutate, type Notification } from '~/graphql'
import { READ_NOTIFICATIONS_MUTATION } from '~/graphql/queries'

export const readNotificationsAction: ActionFunction = async ({ request }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const data = Object.fromEntries(formData) as { location: string }

  const response = await mutate<{ read_notifications: Notification[] }>({
    mutation: READ_NOTIFICATIONS_MUTATION,
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (response.data?.read_notifications == null) {
    return json({ errors: { message: 'Unexpected Error' } }, { status: 400 })
  }

  return redirect(data?.location ?? '/')
}
