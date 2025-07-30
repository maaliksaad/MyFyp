import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../utils'

test.describe('Settings page', () => {
  test('given a logged out user: page redirects the user to the login page', async ({
    page,
    baseURL
  }) => {
    await page.goto('/settings')

    const expectedUrl = new URL(baseURL + '/login')
    expect(page.url()).toEqual(expectedUrl.href)

    await page.close()
  })

  test('given a logged in user: page redirects the user to /settings/account', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/settings')

    const expectedUrl = new URL(baseURL + '/settings/account')
    expect(page.url()).toEqual(expectedUrl.href)

    await page.close()
  })
})
