import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../../utils'

test.describe('Project Details page', () => {
  test('given a logged out user: page redirects the user to the login page', async ({
    page,
    baseURL
  }) => {
    await page.goto('/projects/project-1')
    const expectedUrl = new URL(baseURL + '/login')
    expect(page.url()).toEqual(expectedUrl.href)
    await page.close()
  })

  test('given a logged in user: page should be rendered with correct title', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/projects/project-1')

    await expect(page.getByRole('heading', { name: 'Project' })).toBeVisible()

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto(`/projects/project-1`)

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
