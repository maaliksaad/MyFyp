import { type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { DashboardLayoutComponent } from '~/features/dashboard/components/dashboard-layout'
import { ErrorBoundaryComponent } from '~/features/error-boundary'
import { getNotificationsLoader } from '~/features/notifications/loaders'

export async function loader(arguments_: LoaderFunctionArgs) {
  return await getNotificationsLoader(arguments_)
}

export default function DashboardLayout() {
  const data = useLoaderData<typeof loader>()

  if (data.errors != null) {
    return (
      <ErrorBoundaryComponent
        error="Oops! Something went wrong."
        description={data.errors?.message ?? 'Unexpected Error'}
        className="bg-[#FAFAFA] min-h-64"
      />
    )
  }

  return (
    <DashboardLayoutComponent
      user={data.user}
      notifications={data.notifications}
    />
  )
}
