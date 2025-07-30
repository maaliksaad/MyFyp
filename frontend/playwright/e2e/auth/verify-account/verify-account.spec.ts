import AxeBuilder from '@axe-core/playwright'
import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../../utils'

test.describe('Verify Account page', () => {
  test('given an invalid token: page should redirect the user to /login', async ({
    page
  }) => {
    await page.goto('/verify-account')

    expect(page.url()).toEqual(new URL('/login', page.url()).href)

    await page.close()
  })

  test('given a logged in user: page should redirect the user to /dashboard', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    const url = new URL('/verify-account', baseURL)
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
    const url = new URL('/verify-account', baseURL)
    url.searchParams.set('id', faker.number.int().toString())
    url.searchParams.set('token', faker.string.alpha(32))

    await page.goto(url.href)

    expect(await page.title()).toEqual('Verify Account | techBusters')

    await page.close()
  })

  test('page should have a button', async ({ page, baseURL }) => {
    const url = new URL('/verify-account', baseURL)
    url.searchParams.set('id', faker.number.int().toString())
    url.searchParams.set('token', faker.string.alpha(32))

    await page.goto(url.href)

    await expect(page.getByRole('button', { name: /verify/i })).toBeVisible()

    await page.close()
  })

  test('given valid signup information: should submit the form', async ({
    page,
    baseURL
  }) => {
    const url = new URL('/verify-account', baseURL)
    url.searchParams.set(
      'id',
      faker.number.int({ min: 1, max: 100 }).toString()
    )
    url.searchParams.set('token', faker.string.alpha(32))

    await page.goto(url.href)

    await page.getByRole('button', { name: /verify/i }).click()

    await page.waitForURL(path => path.href.includes('/dashboard'))

    expect(page.url()).toEqual(new URL('/dashboard', baseURL).href)

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
    baseURL
  }) => {
    const url = new URL('/verify-account', baseURL)
    url.searchParams.set('id', faker.number.int().toString())
    url.searchParams.set('token', faker.string.alpha(32))

    await page.goto(url.href)

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
