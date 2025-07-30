import { expect, test } from '@playwright/test'

test.describe('Landing page', () => {
  test('given a logged out user: page redirects the user to /login', async ({
    baseURL,
    page
  }) => {
    await page.goto('/')

    const expectedUrl = new URL(baseURL + '/login')
    expect(page.url()).toEqual(expectedUrl.href)
    await page.close()
  })
})
