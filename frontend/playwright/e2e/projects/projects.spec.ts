import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../utils'

test.describe('Projects page', () => {
  test('given a logged out user: page redirects the user to the login page', async ({
    page,
    baseURL
  }) => {
    await page.goto('/projects')
    const expectedUrl = new URL(baseURL + '/login')
    expect(page.url()).toEqual(expectedUrl.href)
    await page.close()
  })

  test('given a logged in user: page should be rendered with correct title', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/projects')
    expect(await page.title()).toEqual('Projects | techBusters')

    await page.close()
  })

  test('given a logged in user: page should render the projects', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/projects')

    const projects = await page.$$('.project')
    expect(projects.length).toBeGreaterThan(0)

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto(`/projects`)

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
