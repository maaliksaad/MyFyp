import AxeBuilder from '@axe-core/playwright'
import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../../utils'

test.describe('Forgot Password page', () => {
  test('given a logged in user: page should redirect the user to /dashboard', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/forgot-password')

    expect(page.url()).toEqual(new URL('/dashboard', baseURL).href)

    await page.close()
  })

  test('page should be rendered with correct title', async ({ page }) => {
    await page.goto('/forgot-password')
    expect(await page.title()).toEqual('Forgot Password | techBusters')

    await page.close()
  })

  test('page should have a form with email field', async ({ page }) => {
    await page.goto('/forgot-password')

    await expect(page.getByLabel(/email/i)).toBeVisible()

    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible()

    await page.close()
  })

  test('given a valid email: should submit the form', async ({
    page,
    baseURL
  }) => {
    await page.goto('/forgot-password')

    await page.getByLabel(/email/i).fill(faker.internet.email())

    await page.getByRole('button', { name: /continue/i }).click()

    await page.waitForSelector(
      'text= If the email exists in our system, a password reset email will be sent.'
    )

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page
  }) => {
    await page.goto(`/forgot-password`)

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
