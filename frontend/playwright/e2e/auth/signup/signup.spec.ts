import AxeBuilder from '@axe-core/playwright'
import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../../utils'

test.describe('Signup page', () => {
  test('given a logged in user: page should redirect the user to /dashboard', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/signup')

    expect(page.url()).toEqual(new URL('/dashboard', baseURL).href)

    await page.close()
  })

  test('page should be rendered with correct title', async ({ page }) => {
    await page.goto('/signup')
    expect(await page.title()).toEqual('Signup | techBusters')

    await page.close()
  })

  test('page should have a form with name, email and password fields', async ({
    page
  }) => {
    await page.goto('/signup')

    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(
      page.getByRole('checkbox', {
        name: /i have read and agree to the terms of use and privacy policy/i
      })
    ).toBeVisible()

    await expect(
      page.getByRole('button', { name: /create account/i })
    ).toBeVisible()

    await page.close()
  })

  test('given valid signup information: should submit the form', async ({
    page,
    baseURL
  }) => {
    await page.goto('/signup')

    await page.getByLabel(/name/i).fill(faker.person.fullName())
    await page.getByLabel(/email/i).fill(faker.internet.email())
    await page.getByLabel(/password/i).fill(faker.internet.password())
    await page
      .getByRole('checkbox', {
        name: /i have read and agree to the terms of use and privacy policy/i
      })
      .check()

    await page.getByRole('button', { name: /create account/i }).click()

    await page.waitForSelector(
      'text= Account created successfully. Please check your email to verify your account.'
    )

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page
  }) => {
    await page.goto(`/signup`)

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
