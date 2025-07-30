import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild
} from '@headlessui/react'
import {
  CalendarDaysIcon,
  CreditCardIcon,
  TrashIcon
} from '@heroicons/react/20/solid'
import { PencilIcon, PlusCircleIcon } from '@heroicons/react/24/outline'
import { Form, Link } from '@remix-run/react'
import moment from 'moment'
import { Fragment, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { ScanStatusComponent } from '~/components/scan-status'
import type { Activity, Project } from '~/graphql'

export interface ProjectDetailsProperties {
  project: Pick<
    Project,
    | 'project_id'
    | 'name'
    | 'thumbnail'
    | 'created_at'
    | 'scans'
    | 'slug'
    | 'user'
  >
  activities: Activity[]
  state: 'idle' | 'submitting'
}

export function ProjectDetailsComponent({
  project,
  state,
  activities
}: ProjectDetailsProperties) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  return (
    <div className="-mx-4 -my-8 sm:-mx-6">
      <header className="relative isolate">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex flex-col max-w-2xl sm:items-center justify-between sm:flex-row gap-x-8 gap-y-4 lg:mx-0 lg:max-w-none">
            <div className="flex items-center gap-x-6">
              <img
                src={project.thumbnail.url}
                alt={project.name}
                className="h-16 w-16 flex-none rounded-full ring-1 ring-gray-900/10"
              />
              <div>
                <h1 className="mt-1 text-base font-semibold leading-6 text-gray-900">
                  {project.name}
                </h1>
                <span className="text-sm text-gray-500">
                  Created on{' '}
                  {moment(project.created_at as unknown as string).format(
                    'MMMM D, YYYY'
                  )}
                </span>
              </div>
            </div>
            <div className="inline-flex rounded-md gap-x-2">
              <Link
                to={`/projects/${project.slug}/edit`}
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
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div className="px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2">
            <h2 className="text-base font-semibold leading-6 text-gray-900">
              Scans
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8">
              {project.scans.map(scan => (
                <Link
                  to={`/projects/${project.slug}/scans/${scan.slug}`}
                  key={scan.scan_id}
                  aria-label={scan.name}
                  style={{
                    backgroundImage: `url(${scan.input_file.thumbnail})`
                  }}
                  className="relative h-full flex flex-col justify-between items-center p-4 bg-cover bg-center rounded-lg min-h-[250px]"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-indigo-600 opacity-10 rounded-lg z-[1]"></div>

                  <div className="w-full flex justify-end z-10">
                    <ScanStatusComponent status={scan.status} />
                  </div>
                  <div className="w-full z-10">
                    <h3 className="text-sm m-0 font-semibold text-white">
                      {scan.name}
                    </h3>
                    <p className="text-xs text-white/60">
                      {moment(scan.created_at as unknown as string).format(
                        'MMMM D, YYYY'
                      )}
                    </p>
                  </div>
                </Link>
              ))}
              <Link
                to={`/projects/${project.slug}/scans/create`}
                aria-label="Create Scan"
                className="w-full h-full flex flex-col items-center justify-center gap-y-2 rounded-3xl px-6 py-4 border border-indigo-200 min-h-[250px]"
              >
                <div className="relative w-12 h-12 rounded-full bg-indigo-200 flex justify-center items-center">
                  <span className="animate-ping absolute inline-flex h-3/4 w-3/4 rounded-full bg-indigo-400 opacity-50" />
                  <PlusCircleIcon className="text-indigo-600 h-7 w-7" />
                </div>

                <div className="mt-2 flex flex-col text-center">
                  <h2 className="text-lg text-gray-800 font-semibold">
                    Create Scan
                  </h2>
                  <p className="text-gray-500 text-xs">
                    Create a new scan to start showcasing your products
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="lg:col-start-3 lg:row-end-1">
            <h2 className="sr-only">Summary</h2>
            <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5">
              <div className="flex flex-wrap px-4 py-6">
                <div className="flex items-center gap-x-2">
                  <img
                    src={project.user.picture}
                    alt={project.user.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-900">Created By</p>
                    <span className="text-sm font-medium text-gray-900">
                      {project.user.name}
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
                    {moment(project.created_at as unknown as string).format(
                      'MMMM D, YYYY'
                    )}
                  </p>
                </div>
                <div className="mt-4 flex w-full flex-none gap-x-4 ">
                  <p className="flex-none">
                    <span className="sr-only">Status</span>
                    <CreditCardIcon
                      className="h-6 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </p>
                  <span className="text-sm leading-6 text-gray-500">
                    {project.scans.length} Scans
                  </span>
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
                      Delete Project
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete your project? All of
                          your data will be permanently removed from our servers
                          forever. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <Form
                      method="post"
                      action={`/projects/${project.slug}/delete`}
                    >
                      <input
                        className="sr-only"
                        value={project.project_id}
                        name="project_id"
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
