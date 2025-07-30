import { type ActionFunction, json, redirect } from '@remix-run/node'

import { retrieveUserFromSession } from '~/features/user-authentication/session'
import { mutate, type UpdatePasswordInput, type User } from '~/graphql'
import { UPDATE_PASSWORD_MUTATION } from '~/graphql/queries'

export const updatePasswordAction: ActionFunction = async ({ request }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const data = Object.fromEntries(formData) as UpdatePasswordInput & {
    confirm_password: string
  }

  if (data.current_password === data.new_password) {
    return json(
      { errors: { new_password: 'New password must be different' } },
      { status: 400 }
    )
  }

  if (data.new_password !== data.confirm_password) {
    return json(
      { errors: { confirm_password: 'Passwords do not match' } },
      { status: 400 }
    )
  }

  const response = await mutate<{ update_password: User }>({
    mutation: UPDATE_PASSWORD_MUTATION,
    variables: {
      current_password: data.current_password,
      new_password: data.new_password
    },
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (response.data?.update_password == null) {
    return json({ errors: { message: 'Unexpected Error' } }, { status: 400 })
  }

  return redirect('/settings/password')
}
