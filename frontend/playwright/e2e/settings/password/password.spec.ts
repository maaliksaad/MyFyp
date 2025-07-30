import AxeBuilder from '@axe-core/playwright'
import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../../utils'

test.describe('Password Settings page', () => {
  test('given a logged out user: page redirects the user to the login page', async ({
    page,
    baseURL
  }) => {
    await page.goto('/settings/password')
    const expectedUrl = new URL(baseURL + '/login')
    expect(page.url()).toEqual(expectedUrl.href)
    await page.close()
  })

  test('given a logged in user: page should be rendered with correct title', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/settings/password')
    expect(await page.title()).toEqual('Password Settings | techBusters')

    await page.close()
  })

  test('page should have a form with fields', async ({ page, baseURL }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/settings/password')

    await expect(page.getByLabel(/current password/i)).toBeVisible()
    await expect(page.getByLabel(/^new password:$/i)).toBeVisible()
    await expect(page.getByLabel(/confirm new password/i)).toBeVisible()

    await expect(page.getByRole('button', { name: /save/i })).toBeVisible()

    await page.close()
  })

  test('given a valid input: redirect the user to /settings/password', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/settings/password')

    const password1 = faker.internet.password()
    const password2 = faker.internet.password()

    await page.getByLabel(/current password/i).fill(password1)
    await page.getByLabel(/^new password:$/i).fill(password2)
    await page.getByLabel(/confirm new password/i).fill(password2)

    await page.getByRole('button', { name: /save/i }).click()

    await page.waitForURL(url => url.href.includes('/settings/password'))

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/settings/password')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
