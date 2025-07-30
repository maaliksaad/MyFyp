import { json, type LoaderFunction, redirect } from '@remix-run/node'

import { retrieveUserFromSession } from '~/features/user-authentication/session'
import { type Activity, type Project, query, type Scan } from '~/graphql'
import { GET_STATS_QUERY } from '~/graphql/queries'

export const getStatsLoader: LoaderFunction = async ({ request }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  const response = await query<{
    projects: Project[]
    recent_projects: Project[]
    scans: Scan[]
    activities: Activity[]
  }>({
    query: GET_STATS_QUERY,
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (
    response.data?.projects == null ||
    response.data?.activities == null ||
    response.data?.scans == null ||
    response.data?.recent_projects == null
  ) {
    return json({ errors: { message: 'Unexpected Error' } }, { status: 400 })
  }

  return json({
    stats: [
      {
        name: 'Impressions',
        value: Math.floor(Math.random() * (1000 - 10 + 1)) + 10,
        change: '+4.75%',
        changeType: 'positive'
      },
      {
        name: 'Views',
        value: Math.floor(Math.random() * (1000 - 10 + 1)) + 10,
        change: '+10.18%',
        changeType: 'positive'
      },
      {
        name: 'Projects',
        value: response.data.projects.length
      },
      {
        name: 'Scans',
        value: response.data.scans.length
      }
    ],
    activities: response.data.activities,
    projects: response.data.recent_projects
  })
}
