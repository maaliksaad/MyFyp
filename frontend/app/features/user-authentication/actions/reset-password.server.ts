import { type ActionFunction, json, redirect } from '@remix-run/node'

import { mutate, type ResetPasswordInput, type User } from '~/graphql'
import { RESET_PASSWORD_MUTATION } from '~/graphql/queries'

export const resetPasswordAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData) as unknown as ResetPasswordInput & {
    confirmPassword: string
  }

  if (data.password !== data.confirmPassword) {
    return json(
      { errors: { confirmPassword: 'Passwords do not match' } },
      { status: 400 }
    )
  }

  const response = await mutate<{ reset_password: User }>({
    mutation: RESET_PASSWORD_MUTATION,
    variables: {
      id: +data.id,
      token: data.token,
      password: data.password
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (response.data?.reset_password == null) {
    return json(
      { errors: { message: 'Password reset link is invalid' } },
      { status: 400 }
    )
  }

  return redirect('/login')
}
