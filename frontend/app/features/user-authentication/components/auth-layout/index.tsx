import { Link, Outlet } from '@remix-run/react'

import { Logo } from '~/components/ui/logo'

export function AuthLayoutComponent() {
  return (
    <main className="min-h-screen bg-white">
      <div className="flex min-h-screen flex-1">
        <div className="flex flex-1 flex-col md:flex-none">
          <Link to="/" aria-label="Logo" className="pt-8 pl-4 sm:pl-6 md:pl-8">
            <Logo />
          </Link>
          <div className="flex flex-col flex-1 justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-sm md:w-96">
              <Outlet />
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 md:block">
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/images/auth/banner.jpg"
            alt="Auth Banner"
          />
        </div>
      </div>
    </main>
  )
}
