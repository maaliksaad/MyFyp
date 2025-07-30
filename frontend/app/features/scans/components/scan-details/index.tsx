import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild
} from '@headlessui/react'
import { CalendarDaysIcon, TrashIcon } from '@heroicons/react/20/solid'
import {
  ArrowPathIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  PencilIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'
import { Form, Link, useLocation } from '@remix-run/react'
import moment from 'moment'
import { Fragment, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { type Activity, type Project, type Scan } from '~/graphql'

export interface ScanDetailsProperties {
  scan: Scan
  project: Pick<Project, 'project_id' | 'name' | 'slug'>
  activities: Activity[]
  state: 'idle' | 'submitting'
}

export function ScanDetailsComponent({
  scan,
  project,
  state,
  activities
}: ScanDetailsProperties) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openEmbedDialog, setOpenEmbedDialog] = useState(false)

  const VIEWER_URI =
    // @ts-expect-error - ENV is not defined on window
    typeof window === 'undefined' ? '' : window.ENV?.VIEWER_URI ?? ''
  const embedCode = `<iframe src="${VIEWER_URI}/scans/${scan.scan_id}/embed" width="100%" height="600" frameborder="0"></iframe>`

  const location = useLocation()
  const currentPath = location.pathname
  const targetSlug = '/projects/shoes/scans/new-shoe-design'
  return (
    <div className="-mx-4 -my-8 sm:-mx-6">
      <header className="relative isolate">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col max-w-2xl sm:items-center justify-between sm:flex-row gap-x-8 gap-y-4 lg:mx-0 lg:max-w-none">
            <div className="flex flex-col gap-x-6">
              <div className="flex flex-col ">
                <h2 className="text-xl font-semibold text-gray-900">
                  {scan.name}
                </h2>
                <p className="text-xs text-gray-500">
                  Created on{' '}
                  {moment(scan.created_at as unknown as string).format(
                    'MMMM D, YYYY'
                  )}
                </p>
              </div>
            </div>
            <div className="inline-flex rounded-md gap-x-2">
              {scan.status === 'Completed' && typeof window !== 'undefined' && (
                <button
                  type="button"
                  onClick={() => {
                    setOpenEmbedDialog(true)
                  }}
                  className="inline-flex items-center rounded-lg p-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <CodeBracketIcon className="h-4 w-4" />
                  <span className="ml-2 sr-only">Embed</span>
                </button>
              )}
              <Link
                to={`/projects/${project.slug}/scans/${scan.slug}/edit`}
                className="inline-flex items-center rounded-lg p-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <PencilIcon className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">Edit</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpenDeleteDialog(true)
                }}
                className="inline-flex items-center rounded-lg p-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <TrashIcon
                  className="h-4 w-4 text-red-400"
                  aria-hidden="true"
                />
                <span className="sr-only">Delete</span>
              </button>
              {scan.status !== 'Completed' && typeof window !== 'undefined' && (
                <a
                  href={`${VIEWER_URI}/scans/${scan.slug}/preview`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex gap-x-2 items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <span className="">Preview</span>
                  <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div className="px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2">
            <h2 className="text-base font-semibold leading-6 text-gray-900">
              Scan Details
            </h2>

            <div className="mt-4">
              <div className="grid grid-cols sm:grid-cols-3 gap-4">
                <div className="w-full border rounded-xl border-gray-200 p-4 flex flex-col items-center">
                  {scan.status === 'Completed' ? (
                    <CheckCircleIcon
                      aria-label="Scan Completed"
                      className="h-12 w-12 text-green-500"
                    />
                  ) : scan.status === 'Preparing' ? (
                    <ArrowPathIcon
                      aria-label="Scan Preparing"
                      className="h-12 w-12 text-blue-500"
                    />
                  ) : (
                    <ExclamationTriangleIcon
                      aria-label="Scan Failed"
                      className="h-12 w-12 text-red-500"
                    />
                  )}

                  <h2 className="mt-4 text-sm font-semibold text-center">
                    {scan.status}
                  </h2>
                  <p className="text-xs text-gray-500 text-center">
                    Project Status
                  </p>
                </div>
                <div className="w-full border rounded-xl border-gray-200 p-4 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full border-2 border-gray-300 flex justify-center items-center">
                    <LightBulbIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <h2 className="mt-4 text-sm font-semibold text-center">
                    Object
                  </h2>
                  <p className="text-xs text-gray-500 text-center">
                    Scan Focus
                  </p>
                </div>
                <div className="w-full border rounded-xl border-gray-200 p-4 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full border-2 border-gray-300 flex justify-center items-center">
                    <VideoCameraIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <h2 className="mt-4 text-sm font-semibold text-center">
                    Video
                  </h2>
                  <p className="text-xs text-gray-500 text-center">
                    Scan Asset
                  </p>
                </div>
              </div>
            </div>

            <h2 className="mt-4 text-base font-semibold leading-6 text-gray-900">
              Scan Asset
            </h2>

            <div className="mt-4">
              <div className="w-full border rounded-xl border-gray-200 p-4">
                <video
                  aria-label={scan.name}
                  controls
                  loop
                  muted
                  preload="auto"
                  className="w-full max-h-96 object-contain rounded-xl"
                >
                  <source src={scan.input_file.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                <table className="w-full text-md text-[#475467] leading-5 font-medium mt-6">
                  <tbody>
                    <tr>
                      <td width="50%">File</td>
                      <td className="py-2 text-right text-[#475467]">
                        {scan.input_file.name}
                      </td>
                    </tr>
                    <tr>
                      <td width="50%">File Type</td>
                      <td className="py-2 text-right text-[#475467]">
                        {scan.input_file.type}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-start-3 lg:row-end-1">
            <h2 className="sr-only">Summary</h2>
            <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
              <div className="flex flex-wrap px-4 py-6">
                <div className="flex gap-x-2 items-center">
                  <img
                    src={scan.user.picture}
                    alt={scan.user.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="mt-1 flex flex-col">
                    <p className="text-xs text-gray-900">Created By</p>
                    <span className="text-sm font-medium text-gray-900">
                      {scan.user.name}
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 pt-6">
                  <div className="flex-none">
                    <span className="sr-only">Created On</span>
                    <CalendarDaysIcon
                      className="h-6 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-[3px] text-sm">
                    {moment(scan.created_at as unknown as string).format(
                      'MMMM D, YYYY'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-start-3">
            <h2 className="text-sm font-semibold leading-6 text-gray-900">
              Activity
            </h2>
            <ul role="list" className="mt-6 space-y-6">
              {activities.map((activity, index) => (
                <li
                  key={activity.activity_id}
                  className="relative flex gap-x-4"
                >
                  <div
                    className={twMerge(
                      index === activities.length - 1 ? 'h-6' : '-bottom-6',
                      'absolute left-0 top-0 flex w-6 justify-center'
                    )}
                  >
                    <div className="w-px bg-gray-200" />
                  </div>
                  <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                  </div>
                  <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                    <span className="font-medium text-gray-900">
                      {activity.metadata.user_name}
                    </span>{' '}
                    {activity.type} the {activity.entity}.
                  </p>
                  <time
                    dateTime={activity.created_at}
                    className="flex-none py-0.5 text-xs leading-5 text-gray-500"
                  >
                    {moment(activity.created_at as unknown as string).fromNow()}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Transition show={openEmbedDialog} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[100]"
          onClose={setOpenEmbedDialog}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                      <DialogTitle
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Embed Scan
                      </DialogTitle>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Copy and paste the following code snippet to embed
                          this scan in your website.
                        </p>

                        <div className="mt-2">
                          {typeof window !== 'undefined' && (
                            <p className="bg-gray-100 p-4 max-w-full rounded-lg text-sm">
                              {embedCode}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 sm:ml-3 sm:w-auto"
                      /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
                      onClick={async () => {
                        await navigator.clipboard.writeText(embedCode)
                        setOpenEmbedDialog(false)
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition show={openDeleteDialog} as={Fragment}>
        <Dialog className="relative z-[100]" onClose={setOpenDeleteDialog}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <DialogTitle
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Delete Scan
                      </DialogTitle>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete your scan? All of your
                          data will be permanently removed from our servers
                          forever. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <Form
                      method="post"
                      action={`/projects/${project.slug}/scans/${scan.slug}/delete`}
                    >
                      <input
                        className="sr-only"
                        value={scan.scan_id}
                        name="scan_id"
                        readOnly
                      />
                      <button
                        type="submit"
                        disabled={state === 'submitting'}
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                      >
                        {state === 'submitting' ? 'Deleting...' : 'Delete'}
                      </button>
                    </Form>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
