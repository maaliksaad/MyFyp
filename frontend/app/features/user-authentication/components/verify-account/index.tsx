import { Form, useSubmit } from '@remix-run/react'
import type { FormEvent } from 'react'

import { Button } from '~/components/ui/button'
import { type VerifyAccountInput } from '~/graphql'

export interface VerifyAccountProperties {
  errors?: Record<string, string>
  state: 'idle' | 'submitting'
  data: VerifyAccountInput
}

export function VerifyAccountComponent({
  errors,
  state,
  data
}: VerifyAccountProperties) {
  const submit = useSubmit()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    submit(
      {
        id: +data.id,
        token: data.token
      },
      { method: 'post', replace: true }
    )
  }

  return (
    <>
      <div className="flex flex-col gap-y-1">
        <h1 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Verify Account
        </h1>
        <p className="text-sm leading-6 text-gray-500">
          Follow the instructions to verify your account.
        </p>
      </div>

      <div className="mt-6">
        <div>
          <Form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Button type="submit" disabled={state === 'submitting'}>
                {state === 'submitting' ? 'Verifying...' : 'Verify'}
              </Button>
            </div>

            {errors?.message != null && (
              <p className="mt-2 text-sm text-red-600">{errors.message}</p>
            )}
          </Form>
        </div>
      </div>
    </>
  )
}
