import type { MetaFunction } from '@remix-run/node'

import { NotificationSettingsComponent } from '~/features/settings/components/notification-settings'

export const meta: MetaFunction = () => {
  return [
    { title: 'Notifications Settings | techBusters' },
    { name: 'description', content: 'Update your notifications settings' }
  ]
}

export default function NotificationSettingsPage() {
  return <NotificationSettingsComponent />
}
