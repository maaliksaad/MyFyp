import {
  FilmIcon,
  HandThumbUpIcon,
  RectangleGroupIcon,
  UserIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'
import { Form, useSubmit } from '@remix-run/react'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { Button } from '~/components/ui/button'
import { Logo } from '~/components/ui/logo'

const steps = [
  {
    id: 1,
    title: 'Personalize Account',
    description: {
      short: 'Customize your account',
      long: 'Let’s get started by customizing your account'
    },
    icon: UserIcon
  },
  {
    id: 2,
    title: 'Getting to Know',
    description: {
      short: 'Where did you here about us',
      long: 'We would like to know how you heard about us'
    },
    icon: RectangleGroupIcon
  },
  {
    id: 3,
    title: 'Start Showcasing',
    description: {
      short: 'Learn more about the platform',
      long: 'If you want to learn more about the platform, checkout our tutorials.'
    },
    icon: HandThumbUpIcon
  }
]

export interface OnboardingProperties {
  state: 'idle' | 'submitting'
  images: string[]
  platforms: string[]
  errors?: Record<string, string>
}

export function OnboardingComponent({
  state,
  images,
  platforms,
  errors
}: OnboardingProperties) {
  const submit = useSubmit()

  const [currentStep, setCurrentStep] = useState(steps[0])
  const [selectedImage, setSelectedImage] = useState(images[0])
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0])

  const handleContinue = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep.id)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
      return
    }

    submit(
      {
        picture: selectedImage,
        platform: selectedPlatform
      },
      { method: 'post', replace: true }
    )
  }

  return (
    <main className="h-screen lg:flex">
      <div className="h-full bg-gray-50 hidden min-w-[340px] lg:flex flex-col gap-y-16 p-6">
        <Logo />
        <div className="flex flex-col gap-y-10">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={twMerge(
                step.id === currentStep.id ? '' : 'opacity-50',
                'flex items-center gap-x-3'
              )}
            >
              <div className="relative min-h-10 min-w-10 border-[0.5px] border-gray-300 rounded-lg inline-flex justify-center items-center shadow">
                <step.icon className="h-5 w-5 text-gray-900" />
                {index !== steps.length - 1 && (
                  <div className="absolute top-12 w-[1px] h-6 bg-gray-300" />
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-3">
                  <h3 className="truncate text-sm font-medium text-gray-900">
                    {step.title}
                  </h3>
                </div>
                <p className="text-[12px] text-gray-500">
                  {step.description.short}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Form className="h-full w-full flex flex-col justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="relative h-12 w-12 border-[0.5px] border-gray-300 rounded-lg inline-flex justify-center items-center shadow">
            <currentStep.icon className="h-6 w-6 text-gray-900" />
          </div>
          <h1 className="mt-4 text-2xl text-center font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {currentStep.title}
          </h1>
          <p className="mt-1 text-[12px] text-center text-gray-500">
            {currentStep.description.long}
          </p>

          <div className="mt-8 w-full px-4 sm:w-[400px]">
            {currentStep.id === 1 && (
              <div className="mb-6 flex justify-center flex-wrap gap-4">
                {images.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => {
                      setSelectedImage(image)
                    }}
                  >
                    <img
                      src={image}
                      alt={`avatar-${index}`}
                      className={twMerge(
                        'w-16 h-16 rounded-full border-2',
                        selectedImage === image
                          ? 'border-indigo-600 shadow-lg'
                          : 'border-white'
                      )}
                      data-selected={selectedImage === image}
                    />
                  </button>
                ))}
              </div>
            )}

            {currentStep.id === 2 && (
              <div className="mb-6 flex justify-center flex-wrap gap-4">
                {platforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => {
                      setSelectedPlatform(platform)
                    }}
                    type="button"
                    className={twMerge(
                      'rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset hover:bg-gray-50',
                      selectedPlatform === platform
                        ? 'ring-indigo-600'
                        : 'ring-gray-300'
                    )}
                    data-selected={selectedPlatform === platform}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            )}

            {currentStep.id === 3 && (
              <div className="mb-6 flex flex-col justify-center gap-y-4">
                <div className="w-full p-4 flex items-center gap-x-3 rounded-lg border-[0.5px] border-gray-300">
                  <div className="relative min-h-10 min-w-10 border-[0.5px] border-gray-300 rounded-lg inline-flex justify-center items-center shadow">
                    <FilmIcon className="h-6 w-6 text-gray-900" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-3">
                      <h3 className="truncate text-sm font-medium text-gray-900">
                        Publish Your First Project
                      </h3>
                    </div>
                    <p className="text-[12px] text-gray-500">
                      Publish a project to start showcasing your work
                    </p>
                  </div>
                </div>

                <div className="w-full p-4 flex items-center gap-x-3 rounded-lg border-[0.5px] border-gray-300">
                  <div className="relative min-h-10 min-w-10 border-[0.5px] border-gray-300 rounded-lg inline-flex justify-center items-center shadow">
                    <VideoCameraIcon className="h-6 w-6 text-gray-900" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-3">
                      <h3 className="truncate text-sm font-medium text-gray-900">
                        Submit Your First Scan
                      </h3>
                    </div>
                    <p className="text-[12px] text-gray-500">
                      Submit a scan to start showcasing your work
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="button"
              onClick={handleContinue}
              className="w-full py-2"
            >
              {state === 'submitting' ? 'Loading...' : 'Continue'}
            </Button>

            {errors?.message != null && (
              <p className="mt-2 text-sm text-red-600">{errors.message}</p>
            )}
          </div>
        </div>
      </Form>
    </main>
  )
}
