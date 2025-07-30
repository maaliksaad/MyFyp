import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node'
import { useActionData, useNavigation } from '@remix-run/react'

import { createProjectAction } from '~/features/projects/actions'
import { CreateProjectComponent } from '~/features/projects/components/create-project'

export const meta: MetaFunction = () => {
  return [
    { title: 'Create Project | techBusters' },
    { name: 'description', content: 'Create a new project' }
  ]
}

export async function action(arguments_: ActionFunctionArgs) {
  return await createProjectAction(arguments_)
}

export default function CreateProjectPage() {
  const navigation = useNavigation()
  const data = useActionData<typeof action>()

  return (
    <CreateProjectComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      errors={data?.errors}
    />
  )
}
