import { type PropsWithChildren, type SelectHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

type FieldProperties = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
} & PropsWithChildren

export function Select({ label, children, ...properties }: FieldProperties) {
  return (
    <div>
      <label
        htmlFor={properties.id}
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {label}
      </label>
      <div className="mt-2">
        <select
          {...properties}
          className={twMerge(
            'block w-full rounded-md border-0 px-2 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
            properties.className
          )}
        >
          {children}
        </select>
      </div>
    </div>
  )
}
