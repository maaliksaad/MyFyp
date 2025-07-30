import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../../utils'

test.describe('Notifications Settings page', () => {
  test('given a logged out user: page redirects the user to the login page', async ({
    page,
    baseURL
  }) => {
    await page.goto('/settings/notifications')
    const expectedUrl = new URL(baseURL + '/login')
    expect(page.url()).toEqual(expectedUrl.href)
    await page.close()
  })

  test('given a logged in user: page should be rendered with correct title', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/settings/notifications')
    expect(await page.title()).toEqual('Notifications Settings | techBusters')

    await page.close()
  })

  test('page should have a form with fields', async ({ page, baseURL }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/settings/notifications')

    await expect(page.getByLabel(/account/i)).toBeVisible()
    await expect(page.getByLabel(/projects/i)).toBeVisible()
    await expect(page.getByLabel(/scans/i)).toBeVisible()
    await expect(page.getByLabel(/everything/i)).toBeVisible()
    await expect(page.getByLabel(/same as email/i)).toBeVisible()
    await expect(page.getByLabel(/no push notifications/i)).toBeVisible()

    await expect(page.getByRole('button', { name: /save/i })).toBeVisible()

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/settings/notifications')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
