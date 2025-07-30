import { Link, Outlet, useLocation, useNavigate } from '@remix-run/react'
import { twMerge } from 'tailwind-merge'

const tabs = [
  { name: 'Account', href: '/settings/account', current: false },
  { name: 'Password', href: '/settings/password', current: false },
  { name: 'Billing', href: '/settings/billing', current: false },
  { name: 'Notifications', href: '/settings/notifications', current: true }
]

export function SettingsLayoutComponent() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleChange = (href: string) => {
    navigate(href)
  }

  return (
    <div>
      <header>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            defaultValue={tabs.find(tab => tab.current)?.name}
            onChange={event => {
              handleChange(event.target.value)
            }}
          >
            {tabs.map(tab => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              {tabs.map(tab => (
                <Link
                  key={tab.name}
                  to={tab.href}
                  className={twMerge(
                    location.pathname === tab.href
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'w-1/4 border-b-2 pb-4 px-1 text-center text-sm font-medium'
                  )}
                  aria-current={tab.current ? 'page' : undefined}
                >
                  {tab.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  )
}
