import type { MetaFunction } from '@remix-run/node'

import { BillingSettingsComponent } from '~/features/settings/components/billing-settings'

export const meta: MetaFunction = () => {
  return [
    { title: 'Billing Settings | techBusters' },
    { name: 'description', content: 'Update your billing settings' }
  ]
}

export default function BillingSettingsPage() {
  return <BillingSettingsComponent />
}
