import { Form } from '@remix-run/react'

import { Button } from '~/components/ui/button'
import { Field } from '~/components/ui/field'

export interface ForgotPasswordProperties {
  errors?: Record<string, string>
  email?: string
  state: 'idle' | 'submitting'
  success: boolean
}

export function ForgotPasswordComponent({
  errors,
  email,
  state,
  success
}: ForgotPasswordProperties) {
  return (
    <>
      <div className="flex flex-col gap-y-1">
        <h1 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Forgot Password
        </h1>
        <p className="text-sm leading-6 text-gray-500">
          Please fill out the details to reset the password.
        </p>
      </div>

      <div className="mt-6">
        <div>
          <Form method="POST" className="space-y-6">
            <Field
              label="Email:"
              placeholder="Enter your email"
              id="email"
              name="email"
              type="text"
              error={errors?.email}
              defaultValue={email}
              required
            />

            {errors?.message != null && (
              <p className="text-sm text-red-600">{errors.message}</p>
            )}

            {success && (
              <p className="text-sm text-green-600">
                If the email exists in our system, a password reset email will
                be sent.
              </p>
            )}

            <div>
              <Button type="submit" disabled={state === 'submitting'}>
                {state === 'submitting' ? 'Sending link...' : 'Continue'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  )
}
