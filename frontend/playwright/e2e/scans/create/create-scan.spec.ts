import AxeBuilder from '@axe-core/playwright'
import { faker } from '@faker-js/faker'
import { expect, test } from '@playwright/test'

import { loginByCookie } from '../../../utils'

test.describe('Create Scan page', () => {
  test('given a logged out user: page redirects the user to the login page', async ({
    page,
    baseURL
  }) => {
    await page.goto('/projects/my-project/scans/create')
    const expectedUrl = new URL(baseURL + '/login')
    expect(page.url()).toEqual(expectedUrl.href)
    await page.close()
  })

  test('given a logged in user: page should be rendered with correct title', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/projects/my-project/scans/create')
    expect(await page.title()).toEqual('Create Scan | techBusters')

    await page.close()
  })

  test('page should have a form with name and video fields', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/projects/my-project/scans/create')

    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/video/i)).toBeHidden()

    await expect(
      page.getByRole('button', { name: /create scan/i })
    ).toBeVisible()

    await page.close()
  })

  test('given a valid name and video: redirect the user to /scans', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/projects/my-project/scans/create')

    await page.getByLabel(/name/i).fill(faker.lorem.word())
    await page
      .getByLabel(/video/i)
      .setInputFiles('playwright/fixtures/test-video.mp4')

    await page.getByRole('button', { name: /create scan/i }).click()

    await page.waitForURL(url => url.href.includes('/projects'))

    await page.close()
  })

  test('page should not have any automatically detectable accessibility issues', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({ page, baseURL })

    await page.goto('/projects/my-project/scans/create')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])

    await page.close()
  })
})
