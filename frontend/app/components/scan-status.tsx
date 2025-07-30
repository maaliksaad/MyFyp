import { twMerge } from 'tailwind-merge'

const statuses = {
  Completed: 'text-green-700 bg-green-50 ring-green-600/20',
  Preparing: 'text-gray-600 bg-gray-50 ring-gray-500/10',
  Failed: 'text-red-700 bg-red-50 ring-red-600/10'
}

interface ScanStatusProperties {
  status: string
}

export function ScanStatusComponent({ status }: ScanStatusProperties) {
  return (
    <div
      className={twMerge(
        // @ts-expect-error - abc
        statuses[status] as string,
        'rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset'
      )}
    >
      {status}
    </div>
  )
}
