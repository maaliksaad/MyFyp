import { json, type LoaderFunction, redirect } from '@remix-run/node'

import { retrieveUserFromSession } from '~/features/user-authentication/session'
import { type Activity, type Project, query, type Scan } from '~/graphql'
import { GET_SCAN_QUERY } from '~/graphql/queries'

export const getScanLoader: LoaderFunction = async ({ request, params }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  const response = await query<{
    scan: Scan
    project: Project
    activities: Activity[]
  }>({
    query: GET_SCAN_QUERY,
    headers: {
      Authorization: `Bearer ${user.token}`
    },
    variables: {
      scanSlug: params.scanSlug ?? '',
      projectSlug: params.projectSlug ?? ''
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (
    response.data?.scan == null ||
    response.data?.project == null ||
    response.data?.activities == null
  ) {
    return json({ errors: { message: 'Unexpected Error' } }, { status: 400 })
  }

  return json({
    scan: response.data.scan,
    project: response.data.project,
    activities: response.data.activities
  })
}
