import { json, type LoaderFunction, redirect } from '@remix-run/node'

import { AuthLayoutComponent } from '~/features/user-authentication/components/auth-layout'
import { retrieveUserFromSession } from '~/features/user-authentication/session'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await retrieveUserFromSession(request)

  if (user != null) {
    return redirect('/dashboard')
  }

  return json({})
}

export default function AuthLayout() {
  return <AuthLayoutComponent />
}
