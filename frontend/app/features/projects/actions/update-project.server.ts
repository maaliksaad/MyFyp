import { type ActionFunction, json, redirect } from '@remix-run/node'

import { retrieveUserFromSession } from '~/features/user-authentication/session'
import { mutate, type Project, type UpdateProjectInput } from '~/graphql'
import { UPDATE_PROJECT_MUTATION } from '~/graphql/queries'

export const updateProjectAction: ActionFunction = async ({
  request,
  params
}) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const data = Object.fromEntries(formData) as UpdateProjectInput & {
    project_id: string
  }

  const response = await mutate<{ update_project: Project }>({
    mutation: UPDATE_PROJECT_MUTATION,
    variables: {
      name: data.name,
      id: +data.project_id
    },
    headers: {
      Authorization: `Bearer ${user.token}`
    }
  })

  if (response.errors != null) {
    return json({ errors: response.errors }, { status: 400 })
  }

  if (response.data?.update_project == null) {
    return json({ errors: { message: 'Unexpected Error' } }, { status: 400 })
  }

  return redirect(`/projects/${params.projectSlug}`)
}
