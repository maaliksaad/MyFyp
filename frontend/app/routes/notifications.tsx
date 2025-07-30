import { type ActionFunctionArgs, redirect } from '@remix-run/node'

import { readNotificationsAction } from '~/features/notifications/actions'

export async function loader() {
  return redirect('/')
}

export async function action(arguments_: ActionFunctionArgs) {
  return await readNotificationsAction(arguments_)
}
