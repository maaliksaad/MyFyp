import { Form, Link } from '@remix-run/react'

import { Button } from '~/components/ui/button'
import { Field } from '~/components/ui/field'

export interface LoginProperties {
  errors?: Record<string, string>
  email?: string
  state: 'idle' | 'submitting'
}

export function LoginComponent({ errors, email, state }: LoginProperties) {
  return (
    <>
      <div className="flex flex-col gap-y-1">
        <h1 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Login
        </h1>
        <p className="text-sm leading-6 text-gray-500">
          Please fill out the details to login to the account.
        </p>
      </div>

      <div className="mt-6">
        <div>
          <Form method="POST" className="space-y-6">
            <Field
              label="Email:"
              placeholder="Enter your email"
              id="email"
              name="email"
              type="text"
              error={errors?.email}
              defaultValue={email}
              required
            />

            <Field
              label="Password:"
              placeholder="Enter your password"
              id="password"
              name="password"
              type="password"
              error={errors?.password}
              required
            />

            {errors?.message != null && (
              <p className="mt-2 text-sm text-red-600">{errors.message}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex pt-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-3 -mt-1 block text-sm leading-6 text-gray-500"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm leading-6">
                <Link
                  to="/forgot-password"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <Button type="submit" disabled={state === 'submitting'}>
                {state === 'submitting' ? 'Logging in...' : 'Login'}
              </Button>
            </div>

            <p className="mt-2 text-sm text-center leading-6 text-gray-500">
              Don't have an account?
              <Link to="/signup" className="ml-1 text-indigo-600 underline">
                Signup
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </>
  )
}
