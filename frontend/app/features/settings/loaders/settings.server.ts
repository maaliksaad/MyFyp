import { json, type LoaderFunction, redirect } from '@remix-run/node'

import { retrieveUserFromSession } from '~/features/user-authentication/session'

export const settingsLoader: LoaderFunction = async ({ request }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  return json({
    images: [
      'https://techBusters-data.nyc3.cdn.digitaloceanspaces.com/profile-pictures/1.png',
      'https://techBusters-data.nyc3.cdn.digitaloceanspaces.com/profile-pictures/2.png',
      'https://techBusters-data.nyc3.cdn.digitaloceanspaces.com/profile-pictures/3.png',
      'https://techBusters-data.nyc3.cdn.digitaloceanspaces.com/profile-pictures/4.png',
      'https://techBusters-data.nyc3.cdn.digitaloceanspaces.com/profile-pictures/5.png',
      'https://techBusters-data.nyc3.cdn.digitaloceanspaces.com/profile-pictures/6.png',
      'https://techBusters-data.nyc3.cdn.digitaloceanspaces.com/profile-pictures/7.png',
      'https://techBusters-data.nyc3.cdn.digitaloceanspaces.com/profile-pictures/8.png'
    ],
    user
  })
}
