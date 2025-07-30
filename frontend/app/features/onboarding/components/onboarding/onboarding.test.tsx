import { faker } from '@faker-js/faker'
import * as remix from '@remix-run/react'
import { describe, expect, test, vi } from 'vitest'

import {
  OnboardingComponent,
  type OnboardingProperties
} from '~/features/onboarding/components/onboarding'
import { act, createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  state = faker.helpers.arrayElement(['idle', 'submitting']),
  errors = {},
  images = [faker.image.avatar(), faker.image.avatar()],
  platforms = ['Facebook', 'Twitter', 'Instagram']
}: Partial<OnboardingProperties>): OnboardingProperties => ({
  state,
  errors,
  images,
  platforms
})

vi.mock('@remix-run/react', async () => ({
  __esModule: true,
  ...(await vi.importActual('@remix-run/react'))
}))

describe('Onboarding component', () => {
  test('given a state of idle: renders the idle state', async () => {
    const path = '/onboarding'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <OnboardingComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', { level: 3, name: /personalize account/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /getting to know/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /start showcasing/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { level: 1, name: /personalize account/i })
    ).toBeInTheDocument()

    expect(screen.getByAltText(/avatar-0/i)).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /continue/i })
    ).toBeInTheDocument()
  })

  test('given a state of submitting: renders the submitting state', async () => {
    const path = '/onboarding'
    const properties = createProperties({
      state: 'submitting'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <OnboardingComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument()
  })

  test('clicking an image: should change the selected image', async () => {
    const path = '/onboarding'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <OnboardingComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const image = screen.getByAltText(/avatar-0/i)

    await act(async () => {
      image.click()
    })

    expect(image).toHaveAttribute('data-selected', 'true')
  })

  test('given the current step is 1: clicking the continue button should move to the next step', async () => {
    const path = '/onboarding'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <OnboardingComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const button = screen.getByRole('button', { name: /continue/i })

    await act(async () => {
      button.click()
    })

    expect(
      screen.getByRole('heading', { level: 1, name: /getting to know/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /facebook/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /twitter/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /instagram/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /continue/i })
    ).toBeInTheDocument()
  })

  test('clicking a platform: should change the selected platform', async () => {
    const path = '/onboarding'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <OnboardingComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const button = screen.getByRole('button', { name: /continue/i })

    await act(async () => {
      button.click()
    })

    const platform = screen.getByRole('button', { name: /twitter/i })

    await act(async () => {
      platform.click()
    })

    expect(platform).toHaveAttribute('data-selected', 'true')
  })

  test('given the current step is 2: clicking the continue button should move to the next step', async () => {
    const path = '/onboarding'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <OnboardingComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const button = screen.getByRole('button', { name: /continue/i })

    await act(async () => {
      button.click()
    })
    await act(async () => {
      button.click()
    })

    expect(
      screen.getByRole('heading', { level: 1, name: /start showcasing/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /publish your first project/i
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /submit your first scan/i })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /continue/i })
    ).toBeInTheDocument()
  })

  test('given the current step is 3: clicking the continue button should call submit', async () => {
    const submit = vi.fn()

    vi.spyOn(remix, 'useSubmit').mockReturnValue(submit)

    const path = '/onboarding'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <OnboardingComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const button = screen.getByRole('button', { name: /continue/i })

    await act(async () => {
      button.click()
    })
    await act(async () => {
      button.click()
    })
    await act(async () => {
      button.click()
    })

    expect(submit).toBeCalled()
  })

  test('given an error: renders the error message', async () => {
    const path = '/onboarding'
    const properties = createProperties({
      state: 'idle',
      errors: {
        message: 'The data is invalid'
      }
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <OnboardingComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByText(/the data is invalid/i)).toBeInTheDocument()
  })
})
