import { Form, useSubmit } from '@remix-run/react'
import type { FormEvent } from 'react'

import { Button } from '~/components/ui/button'
import { Field } from '~/components/ui/field'
import type { VerifyAccountInput } from '~/graphql'

export interface ResetPasswordProperties {
  errors?: Record<string, string>
  data: VerifyAccountInput
  state: 'idle' | 'submitting'
}

export function ResetPasswordComponent({
  errors,
  data,
  state
}: ResetPasswordProperties) {
  const submit = useSubmit()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const values = event.currentTarget
      .elements as typeof event.currentTarget.elements & {
      password: HTMLInputElement
      confirmPassword: HTMLInputElement
    }

    submit(
      {
        id: +data.id,
        token: data.token,
        password: values.password.value,
        confirmPassword: values.confirmPassword.value
      },
      { method: 'post', replace: true }
    )
  }

  return (
    <>
      <div className="flex flex-col gap-y-1">
        <h1 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Reset Password
        </h1>
        <p className="text-sm leading-6 text-gray-500">
          Please fill out the details to reset the password.
        </p>
      </div>

      <div className="mt-6">
        <div>
          <Form className="space-y-6" onSubmit={handleSubmit}>
            <Field
              label="Enter Password:"
              placeholder="Enter your password"
              id="password"
              name="password"
              type="password"
              error={errors?.password}
              required
            />

            <Field
              label="Confirm Password:"
              placeholder="Enter your password again"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              error={errors?.confirmPassword}
              required
            />

            {errors?.message != null && (
              <p className="mt-2 text-sm text-red-600">{errors.message}</p>
            )}

            <div>
              <Button type="submit" disabled={state === 'submitting'}>
                {state === 'submitting' ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  )
}
