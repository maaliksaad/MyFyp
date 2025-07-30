import { NoSymbolIcon } from '@heroicons/react/24/outline'

export function BillingSettingsComponent() {
  return (
    <div className="text-center mt-20">
      <NoSymbolIcon className="mx-auto h-12 w-12 text-gray-300" />
      <h2 className="mt-2 text-sm font-semibold text-gray-900">
        No Plans Available
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        We don't have any plans available for you at the moment.
      </p>
    </div>
  )
}
