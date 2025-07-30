import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect
} from '@remix-run/node'

import { deleteScanAction } from '~/features/scans/actions'

export async function loader({ params }: LoaderFunctionArgs) {
  return redirect(`/projects/${params.projectSlug}`)
}

export async function action(arguments_: ActionFunctionArgs) {
  return await deleteScanAction(arguments_)
}
