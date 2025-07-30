import { faker } from '@faker-js/faker'
import * as remix from '@remix-run/react'
import { fireEvent, waitFor } from '@testing-library/dom'
import { describe, expect, test, vi } from 'vitest'

import {
  CreateScanComponent,
  type CreateScanProperties
} from '~/features/scans/components/create-scan'
import * as hooks from '~/hooks'
import { createPopulatedFile, createPopulatedProject } from '~/test/factories'
import { act, createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  state = faker.helpers.arrayElement(['idle', 'submitting']),
  errors = {},
  project = createPopulatedProject()
}: Partial<CreateScanProperties> = {}): CreateScanProperties => ({
  state,
  project,
  errors
})

vi.mock('@remix-run/react', async () => ({
  __esModule: true,
  ...(await vi.importActual('@remix-run/react'))
}))

describe('New Scan Component', () => {
  test('given idle state: should render the new scan component', () => {
    const path = '/new-scan'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <CreateScanComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()

    expect(screen.getByLabelText(/video/i)).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /create scan/i })
    ).toBeInTheDocument()
  })

  test('selecting a video: should render the selected video', async () => {
    const path = '/new-scan'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <CreateScanComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const file = new File(['(⌐□_□)'], 'scan.mp4', {
      type: 'video/mp4'
    })

    const fileInput = screen.getByLabelText(
      /video/i
    ) as unknown as HTMLInputElement

    await waitFor(() => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    expect(
      screen.getByRole('button', { name: /create scan/i })
    ).toBeInTheDocument()
  })

  test('given submitting state: should render the submitting state component', () => {
    const path = '/new-scan'
    const properties = createProperties({
      state: 'submitting'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <CreateScanComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('button', { name: /creating/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  test('given errors: should render the error message', () => {
    const path = '/new-scan'
    const properties = createProperties({
      errors: {
        name: `name - ${faker.lorem.sentence()}`,
        message: `message - ${faker.lorem.sentence()}`
      }
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <CreateScanComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByText(properties.errors?.name ?? '')).toBeInTheDocument()
    expect(
      screen.getByText(properties.errors?.message ?? '')
    ).toBeInTheDocument()
  })

  test('clicking the save button: should call handleSubmit', async () => {
    const submit = vi.fn()

    vi.spyOn(remix, 'useSubmit').mockReturnValue(submit)
    vi.spyOn(hooks, 'useFileUploader').mockReturnValue({
      error: null,
      loading: false,
      progress: 0,
      upload: vi.fn(async () => createPopulatedFile())
    })

    const path = '/new-scan'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <CreateScanComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    await waitFor(() => {
      fireEvent.change(screen.getByRole('textbox', { name: /name/i }), {
        target: {
          value: faker.lorem.word()
        }
      })

      fireEvent.change(screen.getByLabelText(/video/i), {
        target: {
          files: [
            new File(['(⌐□_□)'], 'scan.mp4', {
              type: 'video/mp4'
            })
          ]
        }
      })
    })

    const button = screen.getByRole('button', { name: /create scan/i })

    await act(async () => {
      button.click()
    })

    expect(submit).toBeCalled()
  })
})
