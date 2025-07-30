import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData, useNavigation } from '@remix-run/react'

import { ErrorBoundaryComponent } from '~/features/error-boundary'
import { ProjectDetailsComponent } from '~/features/projects/components/project-details'
import { getProjectLoader } from '~/features/projects/loaders'
import { type Project } from '~/graphql'

export const meta: MetaFunction = ({ data }) => {
  const title = `${(data as { project: Project })?.project?.name} - Project | techBusters`

  return [{ title }, { name: 'description', content: 'View your project' }]
}

export async function loader(arguments_: LoaderFunctionArgs) {
  return await getProjectLoader(arguments_)
}

export default function ProjectDetailPage() {
  const navigation = useNavigation()
  const data = useLoaderData<typeof loader>()

  if (data.errors != null) {
    return (
      <ErrorBoundaryComponent
        error="Oops! Something went wrong."
        description={data.errors?.message ?? 'Unexpected Error'}
        className="bg-[#FAFAFA] min-h-64"
      />
    )
  }

  return (
    <ProjectDetailsComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      project={data.project}
      activities={data.activities}
    />
  )
}
