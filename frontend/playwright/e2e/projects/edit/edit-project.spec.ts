import AxeBuilder from '@axe-core/playwright'
import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../../utils'

test.describe('Edit Project page', () => {
  test('given a logged out user: redirects the user to the login page', async ({
    page,
    baseURL
  }) => {
    await page.goto('/projects/my-project/edit')
    const expectedUrl = new URL(baseURL + '/login')
    expect(page.url()).toEqual(expectedUrl.href)
    await page.close()
  })

  test('page should have a form with name field', async ({ page, baseURL }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/projects/my-project/edit')

    await expect(page.getByLabel(/name/i)).toBeVisible()

    await expect(
      page.getByRole('button', { name: /update project/i })
    ).toBeVisible()

    await page.close()
  })

  test('given a valid name: redirect the user to /projects/:slug', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/projects/my-project/edit')

    await page.getByLabel(/name/i).fill(faker.lorem.word())

    await page.getByRole('button', { name: /update project/i }).click()

    await page.waitForURL(url => url.href.includes('/projects'))

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto(`/projects/my-project/edit`)

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
