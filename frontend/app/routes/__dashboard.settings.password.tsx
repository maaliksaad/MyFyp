import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node'
import { useActionData, useNavigation } from '@remix-run/react'

import { updatePasswordAction } from '~/features/settings/actions'
import { PasswordSettingsComponent } from '~/features/settings/components/password-settings'

export const meta: MetaFunction = () => {
  return [
    { title: 'Password Settings | techBusters' },
    { name: 'description', content: 'Update your password settings' }
  ]
}

export async function action(arguments_: ActionFunctionArgs) {
  return await updatePasswordAction(arguments_)
}

export default function PasswordSettingsPage() {
  const navigation = useNavigation()
  const data = useActionData<typeof action>()

  return (
    <PasswordSettingsComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      errors={data?.errors}
    />
  )
}
