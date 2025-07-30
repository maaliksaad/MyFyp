import AxeBuilder from '@axe-core/playwright'
import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../../utils'

test.describe('Create Project page', () => {
  test('given a logged out user: page redirects the user to the login page', async ({
    page,
    baseURL
  }) => {
    await page.goto('/projects/create')
    const expectedUrl = new URL(baseURL + '/login')
    expect(page.url()).toEqual(expectedUrl.href)
    await page.close()
  })

  test('given a logged in user: page should be rendered with correct title', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/projects/create')
    expect(await page.title()).toEqual('Create Project | techBusters')

    await page.close()
  })

  test('page should have a form with name and thumbnail fields', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/projects/create')

    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/thumbnail/i)).toBeHidden()

    await expect(
      page.getByRole('button', { name: /create project/i })
    ).toBeVisible()

    await page.close()
  })

  test('given a valid name and thumbnail: redirect the user to /projects/:slug', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/projects/create')

    await page.getByLabel(/name/i).fill(faker.lorem.word())
    await page
      .getByLabel(/thumbnail/i)
      .setInputFiles('playwright/fixtures/test-image.avif')

    await page.getByRole('button', { name: /create project/i }).click()

    await page.waitForURL(url => url.href.includes('/projects'))

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto(`/projects/create`)

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
