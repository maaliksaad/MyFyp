import { type ActionFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useActionData, useNavigation } from '@remix-run/react'

import { forgotPasswordAction } from '~/features/user-authentication/actions'
import { ForgotPasswordComponent } from '~/features/user-authentication/components/forgot-password'

export const meta: MetaFunction = () => {
  return [
    { title: 'Forgot Password | techBusters' },
    { name: 'description', content: 'Reset your password.' }
  ]
}

export async function action(arguments_: ActionFunctionArgs) {
  return await forgotPasswordAction(arguments_)
}

export default function ForgotPasswordPage() {
  const navigation = useNavigation()
  const data = useActionData<typeof action>()

  return (
    <ForgotPasswordComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      email={data?.values?.email}
      errors={data?.errors}
      success={data?.success ?? false}
    />
  )
}
