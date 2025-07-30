import { Form } from '@remix-run/react'

import { Button } from '~/components/ui/button'

export function NotificationSettingsComponent() {
  return (
    <Form method="post">
      <div className="border-b border-gray-900/10 pb-12">
        <div className="mt-10 space-y-10">
          <fieldset>
            <legend className="text-sm font-semibold leading-6 text-gray-900">
              By Email
            </legend>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              These are delivered via emails to your provided address.
            </p>
            <div className="mt-6 space-y-6">
              <div className="relative flex gap-x-3">
                <div className="flex h-6 items-center">
                  <input
                    id="account"
                    name="account"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                </div>
                <div className="text-sm leading-6">
                  <label
                    htmlFor="account"
                    className="font-medium text-gray-900"
                  >
                    Account
                  </label>
                  <p className="text-gray-500">
                    Get notified when your account is updated.
                  </p>
                </div>
              </div>
              <div className="relative flex gap-x-3">
                <div className="flex h-6 items-center">
                  <input
                    id="projects"
                    name="projects"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                </div>
                <div className="text-sm leading-6">
                  <label
                    htmlFor="projects"
                    className="font-medium text-gray-900"
                  >
                    Projects
                  </label>
                  <p className="text-gray-500">
                    Get notified when your project is updated.
                  </p>
                </div>
              </div>
              <div className="relative flex gap-x-3">
                <div className="flex h-6 items-center">
                  <input
                    id="scans"
                    name="scans"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                </div>
                <div className="text-sm leading-6">
                  <label htmlFor="scans" className="font-medium text-gray-900">
                    Scans
                  </label>
                  <p className="text-gray-500">
                    Get notified when yours scans are ready.
                  </p>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold leading-6 text-gray-900">
              Push Notifications
            </legend>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              These are delivered via SMS to your mobile phone.
            </p>
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-x-3">
                <input
                  id="push-everything"
                  name="push-notifications"
                  type="radio"
                  defaultChecked
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor="push-everything"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Everything
                </label>
              </div>
              <div className="flex items-center gap-x-3">
                <input
                  id="push-email"
                  name="push-notifications"
                  type="radio"
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor="push-email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Same as email
                </label>
              </div>
              <div className="flex items-center gap-x-3">
                <input
                  id="push-nothing"
                  name="push-notifications"
                  type="radio"
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor="push-nothing"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  No push notifications
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-x-6">
        <div></div>
        <Button type="submit" className="w-auto py-2">
          Save
        </Button>
      </div>
    </Form>
  )
}
