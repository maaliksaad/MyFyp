import { type ActionFunction, json } from '@remix-run/node'

import { mutate, type SignupInput, type Verification } from '~/graphql'
import { SIGNUP_MUTATION } from '~/graphql/queries'

export const signupAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData) as SignupInput

  const response = await mutate<{ signup: Verification }>({
    mutation: SIGNUP_MUTATION,
    variables: {
      name: data.name,
      email: data.email,
      password: data.password
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors, values: data }, { status: 400 })
  }

  if (response.data?.signup == null) {
    return json(
      { errors: { message: 'Unexpected Error' }, values: data },
      { status: 400 }
    )
  }

  return json({ success: true })
}
