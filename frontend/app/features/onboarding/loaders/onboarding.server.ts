import { json, type LoaderFunction, redirect } from '@remix-run/node'

import { retrieveUserFromSession } from '~/features/user-authentication/session'

export const onboardingLoader: LoaderFunction = async ({ request }) => {
  const user = await retrieveUserFromSession(request)

  if (user == null) {
    return redirect('/login')
  }

  if (!user.picture.includes('ui-avatars.com')) {
    return redirect('/dashboard')
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
    platforms: [
      'Facebook',
      'Instagram',
      'Twitter',
      'LinkedIn',
      'Discord',
      'Website',
      'Friend',
      'Other'
    ]
  })
}
