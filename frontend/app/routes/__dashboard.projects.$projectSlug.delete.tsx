import { type ActionFunctionArgs, redirect } from '@remix-run/node'

import { deleteProjectAction } from '~/features/projects/actions'

export async function loader() {
  return redirect('/projects')
}

export async function action(arguments_: ActionFunctionArgs) {
  return await deleteProjectAction(arguments_)
}
