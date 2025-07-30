import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData, useNavigation } from '@remix-run/react'

import { ErrorBoundaryComponent } from '~/features/error-boundary'
import { ScanDetailsComponent } from '~/features/scans/components/scan-details'
import { getScanLoader } from '~/features/scans/loaders'
import type { Scan } from '~/graphql'

export const meta: MetaFunction = ({ data }) => {
  const title = `${(data as { scan: Scan })?.scan?.name} - Scan | techBusters`

  return [{ title }, { name: 'description', content: 'View your scan' }]
}

export async function loader(arguments_: LoaderFunctionArgs) {
  return await getScanLoader(arguments_)
}

export default function ScanDetailPage() {
  const navigation = useNavigation()
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
    <ScanDetailsComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      scan={data.scan}
      project={data.project}
      activities={data.activities}
    />
  )
}
