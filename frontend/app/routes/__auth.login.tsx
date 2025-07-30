import { type ActionFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useActionData, useNavigation } from '@remix-run/react'

import { loginAction } from '~/features/user-authentication/actions'
import { LoginComponent } from '~/features/user-authentication/components/login'

export const meta: MetaFunction = () => {
  return [
    { title: 'Login | techBusters' },
    { name: 'description', content: 'Login to your account' }
  ]
}

export async function action(arguments_: ActionFunctionArgs) {
  return await loginAction(arguments_)
}

export default function LoginPage() {
  const navigation = useNavigation()
  const data = useActionData<typeof action>()

  return (
    <LoginComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      errors={data?.errors}
      email={data?.values?.email}
    />
  )
}
