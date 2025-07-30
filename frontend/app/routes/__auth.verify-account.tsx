import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from '@remix-run/node'
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react'

import { verifyAccountAction } from '~/features/user-authentication/actions'
import { VerifyAccountComponent } from '~/features/user-authentication/components/verify-account'
import { verifyAccountLoader } from '~/features/user-authentication/loaders'

export const meta: MetaFunction = () => {
  return [
    { title: 'Verify Account | techBusters' },
    { name: 'description', content: 'Verify your account.' }
  ]
}

export async function loader(arguments_: LoaderFunctionArgs) {
  return await verifyAccountLoader(arguments_)
}

export async function action(arguments_: ActionFunctionArgs) {
  return await verifyAccountAction(arguments_)
}

export default function VerifyAccountPage() {
  const navigation = useNavigation()
  const { id, token } = useLoaderData<typeof loader>()
  const data = useActionData<typeof action>()

  return (
    <VerifyAccountComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      data={{ id, token }}
      errors={data?.errors}
    />
  )
}
