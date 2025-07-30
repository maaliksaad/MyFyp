import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from '@remix-run/node'
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react'

import { ErrorBoundaryComponent } from '~/features/error-boundary'
import { updateProjectAction } from '~/features/projects/actions'
import { EditProjectComponent } from '~/features/projects/components/edit-project'
import { getProjectLoader } from '~/features/projects/loaders'
import type { Project } from '~/graphql'

export const meta: MetaFunction = ({ data }) => {
  const title = `Edit ${
    (data as { project: Project })?.project.name ?? 'Project'
  } | techBusters`

  return [{ title }, { name: 'description', content: 'Edit your project' }]
}

export async function loader(arguments_: LoaderFunctionArgs) {
  return await getProjectLoader(arguments_)
}

export async function action(arguments_: ActionFunctionArgs) {
  return await updateProjectAction(arguments_)
}

export default function EditProjectPage() {
  const navigation = useNavigation()
  const loaderData = useLoaderData<typeof loader>()
  const actionsData = useActionData<typeof action>()

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
    <EditProjectComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      project={loaderData.project}
      errors={actionsData?.errors}
    />
  )
}
