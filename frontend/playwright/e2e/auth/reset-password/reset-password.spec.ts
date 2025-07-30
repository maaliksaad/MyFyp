import AxeBuilder from '@axe-core/playwright'
import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../../utils'

test.describe('Reset Password page', () => {
  test('given an invalid token: page should redirect the user to /login', async ({
    page
  }) => {
    await page.goto('/reset-password')

    expect(page.url()).toEqual(new URL('/login', page.url()).href)

    await page.close()
  })

  test('given a logged in user: page should redirect the user to /dashboard', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    const url = new URL('/reset-password', baseURL)
    url.searchParams.set('id', faker.number.int().toString())
    url.searchParams.set('token', faker.string.alpha(32))

    await page.goto(url.href)

    expect(page.url()).toEqual(new URL('/dashboard', baseURL).href)

    await page.close()
  })

  test('page should be rendered with correct title', async ({
    page,
    baseURL
  }) => {
    const url = new URL('/reset-password', baseURL)
    url.searchParams.set('id', faker.number.int().toString())
    url.searchParams.set('token', faker.string.alpha(32))

    await page.goto(url.href)

    expect(await page.title()).toEqual('Reset Password | techBusters')

    await page.close()
  })

  test('page should have a form with passwords fields', async ({
    page,
    baseURL
  }) => {
    const url = new URL('/reset-password', baseURL)
    url.searchParams.set('id', faker.number.int().toString())
    url.searchParams.set('token', faker.string.alpha(32))

    await page.goto(url.href)

    await expect(page.getByLabel(/enter password/i)).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()

    await expect(
      page.getByRole('button', { name: /reset password/i })
    ).toBeVisible()

    await page.close()
  })

  test('given valid passwords: should submit the form', async ({
    page,
    baseURL
  }) => {
    const url = new URL('/reset-password', baseURL)
    url.searchParams.set(
      'id',
      faker.number.int({ min: 1, max: 100 }).toString()
    )
    url.searchParams.set('token', faker.string.alpha(32))

    await page.goto(url.href)

    const password = faker.internet.password()

    await page.getByLabel(/enter password/i).fill(password)
    await page.getByLabel(/confirm password/i).fill(password)

    await page.getByRole('button', { name: /reset password/i }).click()

    await page.waitForURL(path => path.href.includes('/login'))

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
    baseURL
  }) => {
    const url = new URL('/reset-password', baseURL)
    url.searchParams.set('id', faker.number.int().toString())
    url.searchParams.set('token', faker.string.alpha(32))

    await page.goto(url.href)

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
