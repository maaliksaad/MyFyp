import { json, type LoaderFunction, redirect } from '@remix-run/node'

export const resetPasswordLoader: LoaderFunction = async ({ request }) => {
  const parameters = Object.fromEntries(new URL(request.url).searchParams)

  if (parameters.id == null || parameters.token == null) {
    return redirect('/login')
  }

  return json({ ...parameters })
}
