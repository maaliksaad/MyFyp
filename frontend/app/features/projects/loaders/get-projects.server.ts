import { json, type LoaderFunction, redirect } from '@remix-run/node'

import { retrieveUserFromSession } from '~/features/user-authentication/session'
import { type Project, query } from '~/graphql'
import { GET_PROJECTS_QUERY } from '~/graphql/queries'

export const getProjectsLoader: LoaderFunction = async ({ request }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  const response = await query<{ projects: Project[] }>({
    query: GET_PROJECTS_QUERY,
    headers: {
      Authorization: `Bearer ${user?.token}`
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (response.data?.projects == null) {
    return json({ errors: { message: 'Unexpected Error' } }, { status: 400 })
  }

  return json({
    projects: response.data.projects
  })
}
