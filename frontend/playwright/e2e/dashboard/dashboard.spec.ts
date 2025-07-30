import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../utils'

test.describe('Dashboard page', () => {
  test('given a logged out user: page should redirect the user to /login', async ({
    page,
    baseURL
  }) => {
    await page.goto('/dashboard')

    expect(page.url()).toEqual(new URL('/login', baseURL).href)

    await page.close()
  })

  test('page should be rendered with correct title', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({
      page,
      baseURL
    })

    await page.goto('/dashboard')
    expect(await page.title()).toEqual('Dashboard | techBusters')

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({
      page,
      baseURL
    })

    await page.goto(`/dashboard`)

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
