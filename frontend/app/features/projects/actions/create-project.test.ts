import { faker } from '@faker-js/faker'
import { describe, expect, test, vi } from 'vitest'

import { createProjectAction } from '~/features/projects/actions'
import * as client from '~/graphql/client.server'
import { createPopulatedProject } from '~/test/factories'
import {
  createAuthenticatedRequest,
  toFormData
} from '~/test/server-test-utils'

describe('Create Project Action', () => {
  test('given a logged out user: should redirect to the /login', async () => {
    const request = new Request('http://localhost:3000/projects/create')

    const response = (await createProjectAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  test('given an error while creating project: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/create',
      formData: toFormData({
        name: faker.lorem.words(1),
        thumbnail_id: faker.number.int().toString()
      })
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      errors: {
        message: 'Error while retrieving the projects'
      }
    })

    const response = (await createProjectAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given no data returned from the server: should return a 400 status', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/create',
      formData: toFormData({
        name: faker.lorem.words(1),
        thumbnail_id: faker.number.int().toString()
      })
    })

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {}
    })

    const response = (await createProjectAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(400)
  })

  test('given a logged in user: should redirect to /projects', async () => {
    const request = await createAuthenticatedRequest({
      url: 'http://localhost:3000/projects/create',
      formData: toFormData({
        name: faker.lorem.words(1),
        thumbnail_id: faker.number.int({ min: 1, max: 1000 }).toString()
      })
    })

    const project = createPopulatedProject()

    vi.spyOn(client, 'mutate').mockResolvedValue({
      data: {
        create_project: project
      }
    })

    const response = (await createProjectAction({
      request,
      context: {},
      params: {}
    })) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(`/projects/${project.slug}`)
  })
})
