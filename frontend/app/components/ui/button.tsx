import { type ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

type ButtonProperties = ButtonHTMLAttributes<HTMLButtonElement>

export function Button(properties: ButtonProperties) {
  return (
    <button
      {...properties}
      className={twMerge(
        'flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50',
        properties.className
      )}
    >
      {properties.children}
    </button>
  )
}
