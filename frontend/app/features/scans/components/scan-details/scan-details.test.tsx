import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import {
  ScanDetailsComponent,
  type ScanDetailsProperties
} from '~/features/scans/components/scan-details/index'
import { Entity, ScanStatus } from '~/graphql'
import {
  createPopulatedActivity,
  createPopulatedProject,
  createPopulatedScan
} from '~/test/factories'
import { act, createRemixStub, render, screen } from '~/test/react-test-utils'

const createProperties = ({
  scan = createPopulatedScan(),
  project = createPopulatedProject(),
  activities = Array.from({ length: 5 }, () =>
    createPopulatedActivity({
      entity: Entity.Scan
    })
  ),
  state = faker.helpers.arrayElement(['idle', 'submitting'])
}: Partial<ScanDetailsProperties>): ScanDetailsProperties => ({
  scan,
  project,
  activities,
  state
})

describe('Scan Details Component', () => {
  test('given idle state: it should render the scan details', () => {
    const path = '/scans/1'
    const properties = createProperties({
      scan: createPopulatedScan({
        status: ScanStatus.Completed
      })
    })

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <ScanDetailsComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: new RegExp(properties.scan.name, 'i')
      })
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: /preview/i })).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: new RegExp(properties.scan.status, 'i')
      })
    ).toBeInTheDocument()

    expect(screen.getByLabelText(/scan completed/i)).toBeInTheDocument()
  })

  test('given a valid VIEWER_URI: should render the preview button', () => {
    vi.stubGlobal('ENV', { VIEWER_URI: 'https://viewer.techBusters.com' })

    const path = '/scans/1'
    const properties = createProperties({
      scan: createPopulatedScan({
        status: ScanStatus.Completed
      })
    })

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <ScanDetailsComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByRole('link', { name: /preview/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /preview/i })).toHaveAttribute(
      'href',
      `https://viewer.techBusters.com/scans/${properties.scan.slug}/preview`
    )
  })

  test('given a scan with status preparing: should render the preparing state', () => {
    const path = '/scans/1'
    const properties = createProperties({
      scan: createPopulatedScan({
        status: ScanStatus.Preparing
      })
    })

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <ScanDetailsComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByLabelText(/scan preparing/i)).toBeInTheDocument()
  })

  test('given a scan with status failed: should render the failed state', () => {
    const path = '/scans/1'
    const properties = createProperties({
      scan: createPopulatedScan({
        status: ScanStatus.Failed
      })
    })

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <ScanDetailsComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    expect(screen.getByLabelText(/scan failed/i)).toBeInTheDocument()
  })

  test('clicking the embed button: should open the modal', async () => {
    const path = '/scans/1'
    const properties = createProperties({
      scan: createPopulatedScan({
        status: ScanStatus.Completed
      })
    })

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <ScanDetailsComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const button = screen.getByRole('button', { name: /embed/i })

    expect(button).toBeInTheDocument()

    await act(async () => {
      button.click()
    })

    expect(
      screen.getByRole('heading', { level: 3, name: /embed scan/i })
    ).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
  })

  test('clicking the copy button: should copy the embed code', async () => {
    const copyToClipboard = vi.fn()

    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: copyToClipboard
      }
    })

    const path = '/scans/1'
    const properties = createProperties({
      scan: createPopulatedScan({
        status: ScanStatus.Completed
      })
    })

    const RemixStub = createRemixStub([
      {
        path,
        Component: () => <ScanDetailsComponent {...properties} />
      }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const embedButton = screen.getByRole('button', { name: /embed/i })

    await act(async () => {
      embedButton.click()
    })

    const copyButton = screen.getByRole('button', { name: /copy/i })

    await act(async () => {
      copyButton.click()
    })

    expect(copyToClipboard).toHaveBeenCalled()
  })

  test('clicking the delete button: should open the delete project modal', async () => {
    const path = '/projects'
    const properties = createProperties({
      state: 'idle'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ScanDetailsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })

    expect(deleteButton).toBeInTheDocument()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await act(async () => {
      deleteButton.click()
    })

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('given a submitting state: should render the component', async () => {
    const path = '/projects'
    const properties = createProperties({
      state: 'submitting'
    })

    const RemixStub = createRemixStub([
      { path, Component: () => <ScanDetailsComponent {...properties} /> }
    ])

    render(<RemixStub initialEntries={[path]} />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })

    await act(async () => {
      deleteButton.click()
    })

    expect(
      screen.getByRole('button', { name: /deleting/i })
    ).toBeInTheDocument()
  })
})
