import { Link } from '@remix-run/react'
import { twMerge } from 'tailwind-merge'

export interface ErrorBoundaryProperties {
  error: string
  description: string
  className?: string
}

export function ErrorBoundaryComponent({
  error,
  description,
  className
}: ErrorBoundaryProperties) {
  return (
    <main
      className={twMerge(
        'grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8',
        className
      )}
    >
      <div className="text-center">
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {error}
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">{description}</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Go back home
          </Link>
          <Link to="/support" className="text-sm font-semibold text-gray-900">
            Contact support <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
