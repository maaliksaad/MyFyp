import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react'

import { updateAccountAction } from '~/features/settings/actions'
import { AccountSettingsComponent } from '~/features/settings/components/account-settings'
import { settingsLoader } from '~/features/settings/loaders'

export const meta: MetaFunction = () => {
  return [
    { title: 'Account Settings | techBusters' },
    { name: 'description', content: 'Update your account settings' }
  ]
}

export async function loader(arguments_: LoaderFunctionArgs) {
  return await settingsLoader(arguments_)
}

export async function action(arguments_: ActionFunctionArgs) {
  return await updateAccountAction(arguments_)
}

export default function AccountSettingsPage() {
  const navigation = useNavigation()
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <AccountSettingsComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      user={loaderData.user}
      images={loaderData.images}
      errors={actionData?.errors}
    />
  )
}
