import AxeBuilder from '@axe-core/playwright'
import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../../utils'

test.describe('Login page', () => {
  test('given a logged in user: page should redirect the user to /dashboard', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/login')

    expect(page.url()).toEqual(new URL('/dashboard', baseURL).href)

    await page.close()
  })

  test('page should be rendered with correct title', async ({ page }) => {
    await page.goto('/login')
    expect(await page.title()).toEqual('Login | techBusters')

    await page.close()
  })

  test('page should have a form with email and password fields', async ({
    page
  }) => {
    await page.goto('/login')

    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()

    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()

    await page.close()
  })

  test('given a valid email and password: should submit the form', async ({
    page,
    baseURL
  }) => {
    await page.goto('/login')

    await page.getByLabel(/email/i).fill(faker.internet.email())
    await page.getByLabel(/password/i).fill(faker.internet.password())

    await page.getByRole('button', { name: /login/i }).click()

    await page.waitForURL(url => url.href.includes('/dashboard'))

    expect(page.url()).toEqual(new URL('/dashboard', baseURL).href)

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page
  }) => {
    await page.goto(`/login`)

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
