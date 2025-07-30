import { Form, Link } from '@remix-run/react'

import { Button } from '~/components/ui/button'
import { Field } from '~/components/ui/field'

export interface SignupProperties {
  errors?: Record<string, string>
  name?: string
  email?: string
  success: boolean
  state: 'idle' | 'submitting'
}

export function SignupComponent({
  state,
  errors,
  name,
  email,
  success
}: SignupProperties) {
  return (
    <>
      <div className="flex flex-col gap-y-1">
        <h1 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign up
        </h1>
        <p className="text-sm leading-6 text-gray-500">
          Please fill out the details to sign up for an account.
        </p>
      </div>

      <div className="mt-6">
        <div>
          <Form method="POST" className="space-y-4">
            <Field
              label="Full Name:"
              placeholder="Enter your full name"
              id="name"
              name="name"
              type="text"
              error={errors?.name}
              defaultValue={name}
              required
            />

            <Field
              label="Email:"
              placeholder="Enter your email"
              id="email"
              name="email"
              type="email"
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

            {success && (
              <p className="mt-2 text-sm text-green-600">
                Account created successfully. Please check your email to verify
                your account.
              </p>
            )}

            <div className="flex pt-2">
              <input
                id="agreement"
                name="agreement"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label
                htmlFor="agreement"
                className="ml-3 -mt-1 block text-sm leading-6 text-gray-500"
              >
                I have read and agree to the{' '}
                <Link
                  to="/terms-of-use"
                  className="underline text-indigo-600 hover:text-indigo-500"
                >
                  Terms of Use
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy-policy"
                  className="underline text-indigo-600 hover:text-indigo-500"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div>
              <Button type="submit" disabled={state === 'submitting'}>
                {state === 'submitting'
                  ? 'Creating Account...'
                  : 'Create Account'}
              </Button>
            </div>

            <p className="mt-2 text-sm text-center leading-6 text-gray-500">
              Already have an account?
              <Link to="/login" className="ml-1 text-indigo-600 underline">
                Login
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </>
  )
}
