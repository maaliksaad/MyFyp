import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild
} from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { useLocation, useSubmit } from '@remix-run/react'
import moment from 'moment'
import { twMerge } from 'tailwind-merge'

import { type Notification } from '~/graphql'

export interface NotificationsListProperties {
  open: boolean
  setOpen: (open: boolean) => void
  notifications: Notification[]
}

export function NotificationsListComponent({
  open,
  setOpen,
  notifications
}: NotificationsListProperties) {
  const submit = useSubmit()
  const location = useLocation()

  const handleSubmit = () => {
    submit(
      {
        location: location.pathname
      },
      {
        method: 'post',
        action: '/notifications',
        replace: true
      }
    )
  }

  return (
    <Transition show={open}>
      <Dialog className="relative z-[1000]" onClose={setOpen}>
        <div className="fixed inset-0 bg-black/30" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <TransitionChild
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <DialogTitle
                          as="h2"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Notifications
                        </DialogTitle>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            onClick={handleSubmit}
                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500"
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Read notifications</span>
                            <CheckCircleIcon
                              className="h-6 w-6"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-gray-500">
                          No notifications
                        </p>
                      </div>
                    ) : (
                      <ul
                        role="list"
                        className="flex-1 divide-y divide-gray-100"
                      >
                        {notifications.map(notification => (
                          <li key={notification.notification_id}>
                            <div className="group relative flex items-center px-5 py-4">
                              <div className="-m-1 block flex-1 p-1">
                                <div
                                  className={twMerge(
                                    'absolute inset-0',
                                    notification.read
                                      ? 'bg-transparent'
                                      : 'bg-indigo-50'
                                  )}
                                  aria-hidden="true"
                                />
                                <div className="relative flex flex-1 items-center">
                                  <span className="relative inline-block flex-shrink-0">
                                    <img
                                      className="h-10 w-10 rounded-full"
                                      src={notification.metadata?.thumbnail}
                                      alt={notification.title}
                                    />
                                  </span>
                                  <div className="ml-4">
                                    <p className="text-xs text-gray-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-[0.7rem] text-gray-500">
                                      {moment(
                                        notification.created_at as unknown as string
                                      ).fromNow()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
