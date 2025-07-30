import { Form, useSubmit } from '@remix-run/react'
import type { FormEvent } from 'react'

import { Button } from '~/components/ui/button'
import { Field } from '~/components/ui/field'
import { type Scan } from '~/graphql'

export interface EditScanProperties {
  state: 'idle' | 'submitting'
  errors?: Record<string, string>
  scan: Pick<Scan, 'name' | 'scan_id'>
}

export function EditScanComponent({ errors, state, scan }: EditScanProperties) {
  const submit = useSubmit()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const values = event.currentTarget
      .elements as typeof event.currentTarget.elements & {
      name: HTMLInputElement
    }

    submit(
      {
        name: values.name.value,
        scan_id: scan.scan_id
      },
      { method: 'post', replace: true }
    )
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
        <div className="col-span-full">
          <Field
            label="Name"
            id="name"
            name="name"
            type="text"
            placeholder="Update the scan name"
            error={errors?.name}
            defaultValue={scan.name}
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
          {state === 'submitting' ? 'Updating...' : 'Update Scan'}
        </Button>
      </div>
    </Form>
  )
}
