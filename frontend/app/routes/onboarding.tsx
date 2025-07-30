import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from '@remix-run/node'
import { useActionData, useLoaderData, useNavigation } from '@remix-run/react'
import { onboardingLoader } from 'app/features/onboarding/loaders'

import { onboardingAction } from '~/features/onboarding/actions'
import { OnboardingComponent } from '~/features/onboarding/components/onboarding'

export const meta: MetaFunction = () => {
  return [
    { title: 'Onboarding | techBusters' },
    { name: 'description', content: 'Get started with techBusters' }
  ]
}

export async function loader(arguments_: LoaderFunctionArgs) {
  return await onboardingLoader(arguments_)
}

export async function action(arguments_: ActionFunctionArgs) {
  return await onboardingAction(arguments_)
}

export default function OnboardingPage() {
  const navigation = useNavigation()
  const { platforms, images } = useLoaderData<typeof loader>()
  const data = useActionData<typeof action>()

  return (
    <OnboardingComponent
      state={navigation.state === 'submitting' ? 'submitting' : 'idle'}
      platforms={platforms}
      images={images}
      errors={data?.errors}
    />
  )
}
