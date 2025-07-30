import { type ActionFunction, json, redirect } from '@remix-run/node'

import { retrieveUserFromSession } from '~/features/user-authentication/session'
import { type CreateProjectInput, mutate, type Project } from '~/graphql'
import { CREATE_PROJECT_MUTATION } from '~/graphql/queries'

export const createProjectAction: ActionFunction = async ({ request }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const data = Object.fromEntries(formData) as unknown as CreateProjectInput

  const response = await mutate<{ create_project: Project }>({
    mutation: CREATE_PROJECT_MUTATION,
    variables: {
      name: data.name,
      thumbnail_id: +data.thumbnail_id
    },
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (response.data?.create_project == null) {
    return json({ errors: { message: 'Unexpected Error' } }, { status: 400 })
  }

  return redirect(`/projects/${response.data.create_project.slug}`)
}
