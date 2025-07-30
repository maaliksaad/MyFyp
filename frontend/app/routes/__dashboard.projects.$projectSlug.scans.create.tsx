import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from '@remix-run/node'
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react'

import { getProjectLoader } from '~/features/projects/loaders'
import { createScanAction } from '~/features/scans/actions'
import { CreateScanComponent } from '~/features/scans/components/create-scan'

export const meta: MetaFunction = () => {
  return [
    { title: 'Create Scan | techBusters' },
    { name: 'description', content: 'Create a new scan' }
  ]
}

export async function loader(arguments_: LoaderFunctionArgs) {
  return await getProjectLoader(arguments_)
}

export async function action(arguments_: ActionFunctionArgs) {
  return await createScanAction(arguments_)
}

export default function CreateScanPage() {
  const navigation = useNavigation()
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <CreateScanComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      project={loaderData.project}
      errors={actionData?.errors}
    />
  )
}
