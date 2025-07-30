import { json, type LoaderFunction, redirect } from '@remix-run/node'

import { retrieveUserFromSession } from '~/features/user-authentication/session'
import { type Activity, type Project, query } from '~/graphql'
import { GET_PROJECT_QUERY } from '~/graphql/queries'

export const getProjectLoader: LoaderFunction = async ({ request, params }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  const slug = params.projectSlug ?? ''

  const response = await query<{ project: Project; activities: Activity[] }>({
    query: GET_PROJECT_QUERY,
    variables: {
      slug
    },
    headers: {
      Authorization: `Bearer ${user?.token}`
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (response.data?.project == null || response.data?.activities == null) {
    return json({ errors: { message: 'Unexpected Error' } }, { status: 400 })
  }

  return json({
    project: response.data.project,
    activities: response.data.activities
  })
}
