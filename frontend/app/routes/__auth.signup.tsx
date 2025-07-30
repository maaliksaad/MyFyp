import { type ActionFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useActionData, useNavigation } from '@remix-run/react'

import { signupAction } from '~/features/user-authentication/actions'
import { SignupComponent } from '~/features/user-authentication/components/signup'

export const meta: MetaFunction = () => {
  return [
    { title: 'Signup | techBusters' },
    { name: 'description', content: 'Signup for an account' }
  ]
}

export async function action(arguments_: ActionFunctionArgs) {
  return await signupAction(arguments_)
}

export default function SignupPage() {
  const navigation = useNavigation()
  const data = useActionData<typeof action>()

  return (
    <SignupComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      errors={data?.errors}
      name={data?.values?.name}
      email={data?.values?.email}
      success={data?.success ?? false}
    />
  )
}
