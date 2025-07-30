import { faker } from '@faker-js/faker'
import * as remix from '@remix-run/react'
import { fireEvent, waitFor } from '@testing-library/dom'
import { describe, expect, test, vi } from 'vitest'

import {
  CreateProjectComponent,
  type CreateProjectProperties
} from '~/features/projects/components/create-project'
import * as hooks from '~/hooks'
import { createPopulatedFile } from '~/test/factories'
import { act, createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  state = faker.helpers.arrayElement(['idle', 'submitting']),
  errors = {}
}: Partial<CreateProjectProperties> = {}): CreateProjectProperties => ({
  state,
  errors
})

vi.mock('@remix-run/react', async () => ({
  __esModule: true,
  ...(await vi.importActual('@remix-run/react'))
}))

describe('Create Project Component', () => {
  test('given idle state: should render the create project component', () => {
    const path = '/projects/create'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <CreateProjectComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()

    expect(screen.getByLabelText(/thumbnail/i)).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /create project/i })
    ).toBeInTheDocument()
  })

  test('selecting a thumbnail: should render the selected thumbnail', async () => {
    const path = '/projects/create'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <CreateProjectComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const file = new File(['(⌐□_□)'], 'thumbnail.jpg', {
      type: 'image/jpg'
    })

    const fileInput = screen.getByLabelText(
      /thumbnail/i
    ) as unknown as HTMLInputElement

    await waitFor(() => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    expect(
      screen.getByRole('button', { name: /create project/i })
    ).toBeInTheDocument()
  })

  test('given submitting state: should render the submitting state component', () => {
    const path = '/projects/create'
    const properties = createProperties({
      state: 'submitting'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <CreateProjectComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('button', { name: /creating/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  test('given errors: should render the error message', () => {
    const path = '/projects/create'
    const properties = createProperties({
      errors: {
        name: `name - ${faker.lorem.sentence()}`,
        message: `message - ${faker.lorem.sentence()}`
      }
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <CreateProjectComponent {...properties} /> }
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

    const path = '/projects/create'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <CreateProjectComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    await waitFor(() => {
      fireEvent.change(screen.getByRole('textbox', { name: /name/i }), {
        target: {
          value: faker.lorem.word()
        }
      })

      fireEvent.change(screen.getByLabelText(/thumbnail/i), {
        target: {
          files: [
            new File(['(⌐□_□)'], 'thumbnail.jpg', {
              type: 'image/jpg'
            })
          ]
        }
      })
    })

    const button = screen.getByRole('button', { name: /create project/i })

    await act(async () => {
      button.click()
    })

    expect(submit).toBeCalled()
  })
})
