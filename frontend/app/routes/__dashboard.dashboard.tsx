import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { DashboardComponent } from '~/features/dashboard/components/dashboard'
import { getStatsLoader } from '~/features/dashboard/loaders'

export const meta: MetaFunction = () => {
  return [
    { title: 'Dashboard | techBusters' },
    { name: 'description', content: 'Check out your dashboard' }
  ]
}

export async function loader(arguments_: LoaderFunctionArgs) {
  return await getStatsLoader(arguments_)
}

export default function DashboardLayout() {
  const data = useLoaderData<typeof loader>()

  return (
    <DashboardComponent
      stats={data.stats}
      activities={data.activities}
      projects={data.projects}
    />
  )
}
