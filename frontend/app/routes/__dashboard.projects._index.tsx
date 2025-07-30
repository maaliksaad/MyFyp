import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { ErrorBoundaryComponent } from '~/features/error-boundary'
import { ProjectsComponent } from '~/features/projects/components/projects'
import { getProjectsLoader } from '~/features/projects/loaders'

export const meta: MetaFunction = () => {
  return [
    { title: 'Projects | techBusters' },
    { name: 'description', content: 'View your projects' }
  ]
}

export async function loader(arguments_: LoaderFunctionArgs) {
  return await getProjectsLoader(arguments_)
}

export default function ProjectsPage() {
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

  return <ProjectsComponent projects={data.projects} />
}
