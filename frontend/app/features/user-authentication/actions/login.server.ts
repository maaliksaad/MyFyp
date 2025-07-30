import { type ActionFunction, json } from '@remix-run/node'

import { createUserSession } from '~/features/user-authentication/session'
import { type LoginInput, mutate, type UserWithToken } from '~/graphql'
import { LOGIN_MUTATION } from '~/graphql/queries'

export const loginAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData) as LoginInput & {
    'remember-me': string
  }

  const response = await mutate<{ login: UserWithToken }>({
    mutation: LOGIN_MUTATION,
    variables: {
      email: data.email,
      password: data.password
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors, values: data }, { status: 400 })
  }

  if (response.data?.login == null) {
    return json(
      { errors: { message: 'Unexpected Error' }, values: data },
      { status: 400 }
    )
  }

  return await createUserSession({
    request,
    user: response.data.login,
    remember: data['remember-me'] === 'on',
    redirectTo: '/dashboard'
  })
}
