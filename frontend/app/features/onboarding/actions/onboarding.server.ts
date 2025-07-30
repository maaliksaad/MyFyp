import { type ActionFunction, json, redirect } from '@remix-run/node'

import {
  createUserSession,
  retrieveUserFromSession
} from '~/features/user-authentication/session'
import { mutate, type User } from '~/graphql'
import { UPDATE_ACCOUNT_MUTATION } from '~/graphql/queries'

export const onboardingAction: ActionFunction = async ({ request }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const data = Object.fromEntries(formData) as { picture: string }

  const response = await mutate<{ update_account: User }>({
    mutation: UPDATE_ACCOUNT_MUTATION,
    variables: {
      picture: data.picture
    },
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (response.data?.update_account == null) {
    return json({ errors: { message: 'Unexpected Error' } }, { status: 400 })
  }

  return await createUserSession({
    request,
    user: {
      ...response.data.update_account,
      token: user.token,
      __typename: 'UserWithToken'
    },
    remember: true,
    redirectTo: '/dashboard'
  })
}
