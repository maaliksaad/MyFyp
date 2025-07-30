import { Form } from '@remix-run/react'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { Button } from '~/components/ui/button'
import { Field } from '~/components/ui/field'
import { type User } from '~/graphql'

export interface AccountSettingsProperties {
  state: 'idle' | 'submitting'
  errors?: Record<string, string>
  user: Pick<User, 'name' | 'email' | 'picture'>
  images: string[]
}

export function AccountSettingsComponent({
  errors,
  state,
  images,
  user
}: AccountSettingsProperties) {
  const [selectedImage, setSelectedImage] = useState(user.picture)

  return (
    <Form method="post">
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6 border-b border-gray-900/10 pb-4">
        <div className="col-span-3">
          <Field
            label="Name"
            id="name"
            name="name"
            type="text"
            placeholder="Write your name"
            required
            error={errors?.name}
            defaultValue={user.name}
            className="py-[0.5.1rem] mb-4 bg-[#FAFAFA]"
          />
        </div>

        <div className="col-span-3">
          <Field
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="Write your email"
            required
            readOnly={true}
            defaultValue={user.email}
            className="py-[0.5.1rem] mb-4 bg-[#FAFAFA] cursor-not-allowed"
          />
        </div>

        <div className="col-span-full">
          <p className="block text-sm font-medium leading-6 text-gray-700">
            Profile Picture
          </p>
          <div className="mt-2 mb-6 flex justify-start flex-wrap gap-4">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => {
                  setSelectedImage(image)
                }}
              >
                <img
                  src={image}
                  alt={`avatar-${index}`}
                  className={twMerge(
                    'w-20 h-20 rounded-full border-2',
                    selectedImage === image
                      ? 'border-indigo-600 shadow-lg'
                      : 'border-white'
                  )}
                  data-selected={selectedImage === image}
                />
              </button>
            ))}
          </div>
          <input type="hidden" name="picture" value={selectedImage} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-x-6">
        <div>
          {errors?.message != null && (
            <p className="mt-2 text-sm text-red-600">{errors.message}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-auto py-2"
          disabled={state === 'submitting'}
        >
          {state === 'submitting' ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </Form>
  )
}
