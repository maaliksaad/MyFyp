import { type ActionFunction, json, redirect } from '@remix-run/node'

import { retrieveUserFromSession } from '~/features/user-authentication/session'
import { mutate, type Scan, type UpdateScanInput } from '~/graphql'
import { UPDATE_SCAN_MUTATION } from '~/graphql/queries'

export const updateScanAction: ActionFunction = async ({ request, params }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const data = Object.fromEntries(formData) as UpdateScanInput & {
    scan_id: string
  }

  const response = await mutate<{ update_scan: Scan }>({
    mutation: UPDATE_SCAN_MUTATION,
    variables: {
      name: data.name,
      id: +data.scan_id
    },
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (response.data?.update_scan == null) {
    return json({ errors: { message: 'Unexpected Error' } }, { status: 400 })
  }

  return redirect(`/projects/${params.projectSlug}/scans/${params.scanSlug}`)
}
