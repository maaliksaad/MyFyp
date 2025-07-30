import { type InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

type FieldProperties = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Field({ label, error, ...properties }: FieldProperties) {
  return (
    <div className="w-full">
      {label != null && (
        <label
          htmlFor={properties.id}
          className="block text-sm font-medium leading-6 text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        {...properties}
        className={twMerge(
          'mt-1 block w-full rounded-lg border-0 px-4 py-2.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
          properties.className
        )}
      />
      {error != null && (
        <p className="mt-2 text-sm text-red-600" id={`${properties.id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}
