import { faker } from '@faker-js/faker'
import * as remix from '@remix-run/react'
import { fireEvent, waitFor } from '@testing-library/dom'
import { describe, expect, test, vi } from 'vitest'

import {
  EditScanComponent,
  type EditScanProperties
} from '~/features/scans/components/edit-scan/index'
import * as hooks from '~/hooks'
import { createPopulatedFile } from '~/test/factories'
import { act, createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  state = faker.helpers.arrayElement(['idle', 'submitting']),
  errors = {},
  scan = {
    scan_id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.lorem.word(1)
  }
}: Partial<EditScanProperties> = {}): EditScanProperties => ({
  state,
  errors,
  scan
})

vi.mock('@remix-run/react', async () => ({
  __esModule: true,
  ...(await vi.importActual('@remix-run/react'))
}))

describe('Edit Scan Component', () => {
  test('given idle state: should render the edit scan component', () => {
    const path = '/scans/my-scan/edit'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <EditScanComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /update scan/i })
    ).toBeInTheDocument()
  })

  test('given submitting state: should render the submitting state component', () => {
    const path = '/scans/my-scan/edit'
    const properties = createProperties({
      state: 'submitting'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <EditScanComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('button', { name: /updating/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled()
  })

  test('given errors: should render the error message', () => {
    const path = '/scans/my-scan/edit'
    const properties = createProperties({
      errors: {
        name: `name - ${faker.lorem.sentence()}`,
        message: `message - ${faker.lorem.sentence()}`
      }
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <EditScanComponent {...properties} /> }
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

    const path = '/scans/my-scan/edit'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <EditScanComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    await waitFor(() => {
      fireEvent.change(screen.getByRole('textbox', { name: /name/i }), {
        target: {
          value: faker.lorem.word()
        }
      })
    })

    const button = screen.getByRole('button', { name: /update scan/i })

    await act(async () => {
      button.click()
    })

    expect(submit).toBeCalled()
  })
})
