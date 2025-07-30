import { Form, useSubmit } from '@remix-run/react'
import { type FormEvent, useState } from 'react'

import { FileUploadComponent } from '~/components/file-upload'
import { Button } from '~/components/ui/button'
import { Field } from '~/components/ui/field'
import { type Project } from '~/graphql'
import { useFileUploader } from '~/hooks'

export interface CreateScanProperties {
  state: 'idle' | 'submitting'
  errors?: Record<string, string>
  project: Pick<Project, 'project_id'>
}

export function CreateScanComponent({
  state,
  errors,
  project
}: CreateScanProperties) {
  const submit = useSubmit()

  const [file, setFile] = useState<File | null>(null)

  const {
    progress,
    upload,
    loading: uploading,
    error: uploadError
  } = useFileUploader()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const values = event.currentTarget
      .elements as typeof event.currentTarget.elements & {
      name: HTMLInputElement
    }

    if (file != null) {
      const fileData = await upload(file)

      submit(
        {
          name: values.name.value,
          input_file_id: fileData.file_id,
          project_id: project.project_id
        },
        { method: 'post', replace: true }
      )
    }
  }

  const loading = uploading || state === 'submitting'

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <Form onSubmit={handleSubmit}>
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-6">
        <div className="col-span-full">
          <Field
            label="Name"
            id="name"
            name="name"
            type="text"
            placeholder="Write a new scan name"
            error={errors?.name}
            required
            className="py-[0.5.1rem] mb-4 bg-[#FAFAFA]"
          />
        </div>

        <div className="col-span-full">
          <FileUploadComponent
            label="Video"
            id="video"
            name="video"
            accept="video/*"
            required={true}
            onFileChange={selectedFile => {
              setFile(selectedFile)
            }}
            progress={progress}
            error={uploadError ?? errors?.video}
            loading={uploading}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-x-6">
        <div>
          {errors?.message != null && (
            <p className="mt-2 text-sm text-red-600">{errors.message}</p>
          )}
        </div>
        <Button type="submit" className="w-auto py-2" disabled={loading}>
          {loading ? 'Creating...' : 'Create Scan'}
        </Button>
      </div>
    </Form>
  )
}
