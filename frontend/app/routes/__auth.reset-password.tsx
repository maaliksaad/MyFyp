import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react'

import { resetPasswordAction } from '~/features/user-authentication/actions'
import { ResetPasswordComponent } from '~/features/user-authentication/components/reset-password'
import { resetPasswordLoader } from '~/features/user-authentication/loaders'

export const meta: MetaFunction = () => {
  return [
    { title: 'Reset Password | techBusters' },
    { name: 'description', content: 'Reset your password.' }
  ]
}

export async function loader(arguments_: LoaderFunctionArgs) {
  return await resetPasswordLoader(arguments_)
}

export async function action(arguments_: ActionFunctionArgs) {
  return await resetPasswordAction(arguments_)
}

export default function ResetPasswordPage() {
  const navigation = useNavigation()
  const { id, token } = useLoaderData<typeof loader>()
  const data = useActionData<typeof action>()

  return (
    <ResetPasswordComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      errors={data?.errors}
      data={{ id, token }}
    />
  )
}
