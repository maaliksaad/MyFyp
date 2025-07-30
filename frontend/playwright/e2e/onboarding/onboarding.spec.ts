import { expect, test } from '@playwright/test'

import { createPopulatedUser } from '~/test/factories'

import { loginByCookie } from '../../utils'

test.describe('Onboarding page', () => {
  test('given a logged out user: page should redirect the user to /login', async ({
    page,
    baseURL
  }) => {
    await page.goto('/onboarding')

    expect(page.url()).toEqual(new URL('/login', baseURL).href)

    await page.close()
  })

  test('given an onboarded user: should redirect to /dashboard', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({
      page,
      baseURL,
      user: createPopulatedUser({
        picture:
          'https://techBusters-data.nyc3.cdn.digitaloceanspaces.com/profile-pictures/1.png'
      })
    })

    await page.goto('/onboarding')

    expect(page.url()).toEqual(new URL('/dashboard', baseURL).href)

    await page.close()
  })

  test('page should be rendered with correct title', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({
      page,
      baseURL,
      user: createPopulatedUser({
        picture:
          'https://ui-avatars.com/api/?background=4f46e5&color=fff&name=Davis'
      })
    })

    await page.goto('/onboarding')
    expect(await page.title()).toEqual('Onboarding | techBusters')

    await page.close()
  })

  test('given valid data: should submit the form', async ({
    page,
    baseURL
  }) => {
    await loginByCookie({
      page,
      baseURL,
      user: createPopulatedUser({
        picture:
          'https://ui-avatars.com/api/?background=4f46e5&color=fff&name=Davis'
      })
    })

    await page.goto('/onboarding')

    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByRole('button', { name: /continue/i }).click()

    await page.waitForURL(url => url.href.includes('/dashboard'))

    expect(page.url()).toEqual(new URL('/dashboard', baseURL).href)

    await page.close()
  })
})
