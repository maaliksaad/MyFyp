import type { LoaderFunction } from '@remix-run/node'

import { logout } from '~/features/user-authentication/session'

export const loader: LoaderFunction = async ({ request }) => {
  return await logout(request)
}
