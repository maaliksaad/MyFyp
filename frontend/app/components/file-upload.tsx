import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  type ChangeEvent,
  type InputHTMLAttributes,
  useCallback,
  useState
} from 'react'
import { useDropzone } from 'react-dropzone-esm'

type FileUploadProperties = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  onFileChange: (file: File | null) => void
  progress: number
  loading: boolean
}

export function FileUploadComponent({
  label,
  error,
  onFileChange,
  progress,
  loading,
  ...properties
}: FileUploadProperties) {
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
    onFileChange(acceptedFiles[0])
  }, [])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files != null && files.length > 0) {
      onDrop([...files])
    }
  }

  const handleRemoveFile = () => {
    if (progress > 0) {
      return
    }

    setFile(null)
    onFileChange(null)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    accept: {
      [properties.accept ?? '']: []
    }
  })

  const getProgress = () => {
    if (error != null) {
      return 'Failed to upload'
    }

    if (progress === 0 && !loading) {
      return 'Ready to upload'
    }

    if (progress === 100 && loading) {
      return 'Processing'
    }

    if (progress === 100 && !loading) {
      return 'Uploaded'
    }

    return `${progress}% uploaded`
  }

  return (
    <>
      <label
        htmlFor={properties.id}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      {file == null ? (
        <div className="mt-2">
          <div
            {...getRootProps()}
            className={`flex justify-center rounded-md border px-6 pt-5 pb-6 ${
              isDragActive ? 'border-indigo-600 bg-gray-100' : 'border-gray-300'
            }`}
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex justify-center text-sm text-gray-600">
                <div className="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none">
                  <span>Upload a {properties.name}</span>
                  <input
                    {...getInputProps()}
                    className="sr-only"
                    onChange={handleFileChange}
                    {...properties}
                  />
                </div>
                <p className="pl-1">or drag and drop</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex w-full items-center justify-between rounded-md border-0 p-4 text-gray-900 ring-1 ring-inset ring-gray-300">
          <div className="flex items-center gap-4">
            {file.type.startsWith('image') ? (
              <img
                src={URL.createObjectURL(file)}
                alt="Select file"
                className="h-12 w-12 rounded-md object-cover"
              />
            ) : file.type.startsWith('video') ? (
              <video className="h-12 w-12 rounded-md object-cover">
                <source src={URL.createObjectURL(file)} type={file.type} />
              </video>
            ) : (
              <div className="h-12 w-12 rounded-md bg-gray-200" />
            )}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium lowercase">{file.name}</span>
              <span className="text-xs text-gray-500">{getProgress()}</span>
            </div>
          </div>
          <button onClick={handleRemoveFile}>
            <XMarkIcon className="h-6 w-6 cursor-pointer text-gray-400" />
            <span className="sr-only">Remove File</span>
          </button>
        </div>
      )}
    </>
  )
}
