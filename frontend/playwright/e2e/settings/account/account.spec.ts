import AxeBuilder from '@axe-core/playwright'
import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../../utils'

test.describe('Account Settings page', () => {
  test('given a logged out user: page redirects the user to the login page', async ({
    page,
    baseURL
  }) => {
    await page.goto('/settings/account')
    const expectedUrl = new URL(baseURL + '/login')
    expect(page.url()).toEqual(expectedUrl.href)
    await page.close()
  })

  test('given a logged in user: page should be rendered with correct title', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/settings/account')
    expect(await page.title()).toEqual('Account Settings | techBusters')

    await page.close()
  })

  test('page should have a form with fields', async ({ page, baseURL }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/settings/account')

    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/picture/i)).toBeHidden()

    await expect(page.getByRole('button', { name: /save/i })).toBeVisible()

    await page.close()
  })

  test('given a valid input: redirect the user to /settings/account', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/settings/account')

    await page.getByLabel(/name/i).fill(faker.lorem.word())

    await page.getByRole('button', { name: /save/i }).click()

    await page.waitForURL(url => url.href.includes('/settings/account'))

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/settings/account')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
