import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import axios from 'axios'
import { useEffect, useState } from 'react'

import { type File as FileType } from '~/graphql'

const SERVER_URI =
  typeof window === 'undefined'
    ? ''
    : // @ts-expect-error - ENV doesn't exist on window
      window.ENV?.SERVER_URI ?? ''

export function useFileUploader() {
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const uppy = new Uppy({ debug: true, autoProceed: true })

  useEffect(() => {
    return () => {
      uppy.cancelAll()
    }
  }, [])

  async function upload(file: File): Promise<FileType> {
    return await new Promise((resolve, reject) => {
      setLoading(true)
      setError(null)

      uppy.addFile({
        name: file.name,
        type: file.type,
        data: file
      })

      uppy.use(Tus, {
        endpoint: `${SERVER_URI}/files`,
        chunkSize: 1024 * 1024 * 10,
        removeFingerprintOnSuccess: true,
        headers: {
          'file-name': file?.name,
          'file-type': file?.type
        },
        onShouldRetry: () => {
          return false
        }
      })

      uppy.on('progress', (value: number) => {
        setProgress(value)
      })

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      uppy.on('complete', async result => {
        try {
          if (result.successful != null && result.successful.length > 0) {
            const url = result.successful[0].uploadURL.split('/').pop()
            const key = url?.split('?').shift() ?? ''

            if (key == null) {
              setError('Failed to upload file')
              reject(new Error('Unable to get file key'))
            } else {
              const { data } = await axios.get<FileType>(
                `${SERVER_URI}/files/${key}`
              )

              resolve(data)
            }
          } else {
            setError('Failed to upload file')
            reject(new Error('Unable to upload file'))
          }
        } catch (error_) {
          setError('Failed to upload file')
          reject(error_)
        } finally {
          setLoading(false)
        }
      })

      uppy.on('error', () => {
        setError('Failed to upload file')
        setProgress(0)
      })
    })
  }

  return { error, loading, progress, upload }
}
