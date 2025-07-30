import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  TransitionChild
} from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import { Link, Outlet, useLocation } from '@remix-run/react'
import { Fragment, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { Logo } from '~/components/ui/logo'
import { NotificationsListComponent } from '~/features/notifications/components/notifications-list'
import { type Notification, type User } from '~/graphql'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarSquareIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }
]

const profile = [
  { name: 'Account', href: '/settings/account' },
  { name: 'Logout', href: '/logout' }
]

export interface DashboardLayoutProperties {
  user: Pick<User, 'name' | 'picture'>
  notifications: Notification[]
}

export function DashboardLayoutComponent({
  user,
  notifications
}: DashboardLayoutProperties) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const location = useLocation()

  const isRouteActive = (href: string) => location.pathname.includes(href)

  const getPageTitle = () => {
    switch (true) {
      case location.pathname === '/dashboard': {
        return 'Dashboard'
      }
      case location.pathname === '/projects': {
        return 'Projects'
      }
      case location.pathname === '/projects/create': {
        return 'Create Project'
      }
      case /^\/projects\/([^/]+)$/.test(location.pathname): {
        return 'Project'
      }
      case /^\/projects\/([^/]+)\/scans\/create$/.test(location.pathname): {
        return 'Create Scan'
      }
      case /^\/projects\/([^/]+)\/scans\/([^/]+)$/.test(location.pathname): {
        return 'Scan'
      }
      case location.pathname.includes('/settings'): {
        return 'Settings'
      }
      default: {
        return 'techBusters'
      }
    }
  }

  const unreadNotifications = notifications.filter(
    notification => !notification.read
  )

  return (
    <div className="min-h-screen">
      <Transition show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          aria-label="Mobile sidebar"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </TransitionChild>

          <div className="fixed inset-0 flex">
            <TransitionChild
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2 ">
                  <Link
                    to="/"
                    className="flex h-16 shrink-0 items-center"
                    aria-label="techBusters"
                  >
                    <Logo />
                  </Link>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-6 space-y-1">
                          {navigation.map(item => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                className={twMerge(
                                  isRouteActive(item.href)
                                    ? 'bg-indigo-50/80 text-indigo-600 after:content-[attr(data-icon)] after:w-1 after:h-full after:rounded-r-md after:absolute after:left-0 after:top-0 after:bg-indigo-600'
                                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                                  'relative overflow-hidden group flex gap-x-3 py-2 px-4 text-sm leading-6 font-semibold'
                                )}
                              >
                                <item.icon
                                  className={twMerge(
                                    isRouteActive(item.href)
                                      ? 'text-indigo-600'
                                      : 'text-gray-400 group-hover:text-indigo-600',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                <span className="mt-[0.1rem]">{item.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pt-12">
          <header
            className="flex h-16 -mx-2 shrink-0 items-center"
            aria-label="techBusters"
          >
            <Link to="/" aria-label="techBusters">
              <Logo />
            </Link>
          </header>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-6 space-y-2">
                  {navigation.map(item => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={twMerge(
                          isRouteActive(item.href)
                            ? 'bg-indigo-50/80 text-indigo-600 after:content-[attr(data-icon)] after:w-1 after:h-full after:rounded-r-md after:absolute after:left-0 after:top-0 after:bg-indigo-600'
                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50',
                          'relative overflow-hidden group flex gap-x-3 py-2 px-4 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={twMerge(
                            isRouteActive(item.href)
                              ? 'text-indigo-600'
                              : 'text-gray-400 group-hover:text-indigo-600',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        <span className="mt-[0.1rem]">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <main className="lg:pl-60">
        <div className="sticky top-0 z-40 flex justify-between gap-x-6 bg-white sm:px-6 py-4 px-6 shadow-sm lg:relative">
          <div className="flex gap-x-2">
            <button
              type="button"
              className="flex-1 -m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => {
                setSidebarOpen(true)
              }}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="text-2xl font-medium">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-x-4">
            <div className="relative inline-flex w-fit">
              {unreadNotifications.length > 0 && (
                <p
                  aria-label="Notifications Count"
                  className="absolute bottom-auto left-auto right-0 top-0 z-10 inline-block -translate-y-1/2 translate-x-2/4 rotate-0 skew-x-0 skew-y-0 scale-x-100 scale-y-100 whitespace-nowrap rounded-full bg-indigo-700 px-1.5 py-1 text-center align-baseline text-[0.7rem] leading-none text-white"
                >
                  {unreadNotifications.length > 9
                    ? '9+'
                    : unreadNotifications.length}
                </p>
              )}
              <button
                onClick={() => {
                  setNotificationsOpen(true)
                }}
              >
                <BellIcon
                  className="h-6 w-6 text-neutral-500"
                  aria-hidden="true"
                />
                <span className="sr-only">Notifications</span>
              </button>
            </div>

            <Menu as="div" className="relative inline-block text-left">
              <div>
                <MenuButton className="flex items-center gap-x-4 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50">
                  <span className="sr-only">Your profile</span>
                  <img
                    className="h-8 w-8 rounded-full bg-gray-50"
                    src={user.picture}
                    alt={user.name}
                  />
                </MenuButton>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {profile.map(item => (
                      <MenuItem key={item.name}>
                        <Link
                          to={item.href}
                          className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          {item.name}
                        </Link>
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Transition>
            </Menu>
          </div>
        </div>

        <div className="h-full px-4 py-8 sm:px-6">
          <Outlet />
        </div>
      </main>

      <NotificationsListComponent
        open={notificationsOpen}
        setOpen={setNotificationsOpen}
        notifications={notifications}
      />
    </div>
  )
}
