import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from '@remix-run/node'
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react'

import { ErrorBoundaryComponent } from '~/features/error-boundary'
import { updateScanAction } from '~/features/scans/actions'
import { EditScanComponent } from '~/features/scans/components/edit-scan'
import { getScanLoader } from '~/features/scans/loaders'
import type { Scan } from '~/graphql'

export const meta: MetaFunction = ({ data }) => {
  const title = `Edit ${(data as { scan: Scan })?.scan?.name ?? 'Scan'} | techBusters`

  return [{ title }, { name: 'description', content: 'View your scan' }]
}

export async function loader(arguments_: LoaderFunctionArgs) {
  return await getScanLoader(arguments_)
}

export async function action(arguments_: ActionFunctionArgs) {
  return await updateScanAction(arguments_)
}

export default function EditScanPage() {
  const navigation = useNavigation()
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  if (loaderData.errors != null) {
    return (
      <ErrorBoundaryComponent
        error="Oops! Something went wrong."
        description={loaderData.errors?.message ?? 'Unexpected Error'}
        className="bg-[#FAFAFA] min-h-64"
      />
    )
  }

  return (
    <EditScanComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      scan={loaderData.scan}
      errors={actionData?.errors}
    />
  )
}
