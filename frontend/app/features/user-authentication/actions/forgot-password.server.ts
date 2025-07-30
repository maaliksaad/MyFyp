import { type ActionFunction, json } from '@remix-run/node'

import { type ForgotPasswordInput, mutate, type PasswordReset } from '~/graphql'
import { FORGOT_PASSWORD_MUTATION } from '~/graphql/queries'

export const forgotPasswordAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData) as ForgotPasswordInput

  const response = await mutate<{ forgot_password: PasswordReset }>({
    mutation: FORGOT_PASSWORD_MUTATION,
    variables: {
      email: data.email
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors, values: data }, { status: 400 })
  }

  if (response.data?.forgot_password == null) {
    return json(
      { errors: { message: 'Unexpected Error' }, values: data },
      { status: 400 }
    )
  }

  return json({ success: true, values: data })
}
