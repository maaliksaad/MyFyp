import { Form } from '@remix-run/react'

import { Button } from '~/components/ui/button'
import { Field } from '~/components/ui/field'

export interface PasswordSettingsProperties {
  state: 'idle' | 'submitting'
  errors?: Record<string, string>
}

export function PasswordSettingsComponent({
  errors,
  state
}: PasswordSettingsProperties) {
  return (
    <Form method="post">
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6 border-b border-gray-900/10 pb-4">
        <div className="col-span-full">
          <Field
            label="Current Password:"
            placeholder="Enter your old password"
            id="password"
            name="current_password"
            type="password"
            error={errors?.current_password}
            required
            className="py-[0.5.1rem] mb-4 bg-[#FAFAFA]"
          />
        </div>

        <div className="col-span-3">
          <Field
            label="New Password:"
            placeholder="Enter your new password"
            id="password"
            name="new_password"
            type="password"
            error={errors?.new_password}
            required
            className="py-[0.5.1rem] mb-4 bg-[#FAFAFA]"
          />
        </div>

        <div className="col-span-3">
          <Field
            label="Confirm New Password:"
            placeholder="Enter your password again"
            id="confirmPassword"
            name="confirm_password"
            type="password"
            error={errors?.confirm_password}
            required
            className="py-[0.5.1rem] mb-4 bg-[#FAFAFA]"
          />
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
