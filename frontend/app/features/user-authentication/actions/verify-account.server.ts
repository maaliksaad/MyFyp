import { type ActionFunction, json } from '@remix-run/node'

import { createUserSession } from '~/features/user-authentication/session'
import { mutate, type UserWithToken, type VerifyAccountInput } from '~/graphql'
import { VERIFY_ACCOUNT_MUTATION } from '~/graphql/queries'

export const verifyAccountAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData) as unknown as VerifyAccountInput

  const response = await mutate<{ verify_account: UserWithToken }>({
    mutation: VERIFY_ACCOUNT_MUTATION,
    variables: {
      id: +data.id,
      token: data.token
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (response.data?.verify_account == null) {
    return json(
      { errors: { message: 'Account verification link is invalid' } },
      { status: 400 }
    )
  }

  return await createUserSession({
    request,
    user: response.data.verify_account,
    remember: true,
    redirectTo: '/dashboard'
  })
}
