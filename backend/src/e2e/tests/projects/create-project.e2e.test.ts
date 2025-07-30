import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { generateJWTToken } from '@/e2e/util'
import { createPopulatedFile, createPopulatedUser } from '@/factories'
import { File, Project, User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'
import { createAndSaveProject } from '@/tests/util'

const query = gql`
  mutation ($name: String!, $thumbnail_id: Int!) {
    create_project(data: { name: $name, thumbnail_id: $thumbnail_id }) {
      project_id
      name
      thumbnail {
        file_id
        url
      }
      slug
      user {
        user_id
        name
      }
    }
  }
`

describe('Mutation: create_project', () => {
  let app: INestApplication
  let projectModel: typeof Project
  let fileModel: typeof File
  let userModel: typeof User

  beforeAll(async () => {
    app = await createTestingApp()

    projectModel = app.get<typeof Project>(getModelToken(Project))
    fileModel = app.get<typeof File>(getModelToken(File))
    userModel = app.get<typeof User>(getModelToken(User))

    await app.listen(0)
  })

  afterEach(async () => {
    await projectModel.destroy({
      truncate: true
    })
    await fileModel.destroy({
      truncate: true
    })
    await userModel.destroy({
      truncate: true
    })
  })

  afterAll(async () => {
    await app.close()
  })

  it('given a logged out user: should throw unauthorized exception', async () => {
    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        name: '',
        thumbnail_id: 1
      })

    expect(errors).toMatchObject([
      {
        message: 'Unauthorized'
      }
    ])
  })

  it('given a logged in user and no name: should throw error', async () => {
    const user = createPopulatedUser({
      verified: true
    })
    await userModel.create({ ...user })

    const token = await generateJWTToken(user)

    const { errors } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .variables({
        name: '',
        thumbnail_id: 1
      })

    expect(errors).toMatchObject([
      {
        message: {
          name: 'name should not be empty'
        }
      }
    ])
  })

  it('given a logged in user and invalid thumbnail_id: should throw error', async () => {
    const user = createPopulatedUser({
      verified: true
    })
    await userModel.create({ ...user })

    const token = await generateJWTToken(user)

    const file = createPopulatedFile()

    const { errors } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .variables({
        name: file.name,
        thumbnail_id: file.file_id
      })

    expect(errors).toMatchObject([
      {
        message: 'File not found'
      }
    ])
  })

  it('given a logged in user and valid data: should return the created project', async () => {
    const { project, user, thumbnail } = await createAndSaveProject({
      userModel,
      fileModel,
      projectModel
    })

    const token = await generateJWTToken(user)

    const { data } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .variables({
        name: project.name,
        thumbnail_id: thumbnail.file_id
      })
      .expectNoErrors()

    expect(data).toMatchObject({
      create_project: {
        project_id: expect.any(Number),
        name: project.name,
        thumbnail: {
          file_id: thumbnail.file_id,
          url: thumbnail.url
        },
        user: {
          user_id: user.user_id,
          name: user.name
        }
      }
    })
  })
})
