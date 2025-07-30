import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { generateJWTToken } from '@/e2e/util'
import {
  createPopulatedFile,
  createPopulatedProject,
  createPopulatedUser
} from '@/factories'
import { File, Project, Scan, User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'
import { createAndSaveScan } from '@/tests/util'

const query = gql`
  mutation ($name: String!, $input_file_id: Int!, $project_id: Int!) {
    create_scan(
      data: {
        name: $name
        input_file_id: $input_file_id
        project_id: $project_id
      }
    ) {
      scan_id
      name
      input_file {
        file_id
        url
      }
      user {
        user_id
        name
      }
    }
  }
`

describe('Mutation: create_scan', () => {
  let app: INestApplication
  let scanModel: typeof Scan
  let fileModel: typeof File
  let userModel: typeof User
  let projectModel: typeof Project

  beforeAll(async () => {
    app = await createTestingApp()

    scanModel = app.get<typeof Scan>(getModelToken(Scan))
    fileModel = app.get<typeof File>(getModelToken(File))
    userModel = app.get<typeof User>(getModelToken(User))
    projectModel = app.get<typeof Project>(getModelToken(Project))

    await app.listen(0)
  })

  afterEach(async () => {
    await scanModel.destroy({
      truncate: true
    })
    await fileModel.destroy({
      truncate: true
    })
    await userModel.destroy({
      truncate: true
    })
    await projectModel.destroy({
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
        input_file_id: 1,
        project_id: 1
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
        input_file_id: 1,
        project_id: 1
      })

    expect(errors).toMatchObject([
      {
        message: {
          name: 'name should not be empty'
        }
      }
    ])
  })

  it('given a logged in user and invalid input_file_id: should throw error', async () => {
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
        input_file_id: file.file_id,
        project_id: 1
      })

    expect(errors).toMatchObject([
      {
        message: 'File not found'
      }
    ])
  })

  it('given a logged in user and invalid project_id: should throw error', async () => {
    const user = createPopulatedUser({
      verified: true
    })
    await userModel.create({ ...user })

    const token = await generateJWTToken(user)

    const file = createPopulatedFile()
    await fileModel.create({ ...file })

    const project = createPopulatedProject()

    const { errors } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .variables({
        name: file.name,
        input_file_id: file.file_id,
        project_id: project.project_id
      })

    expect(errors).toMatchObject([
      {
        message: 'Project not found'
      }
    ])
  })

  it('given a logged in user and valid data: should return the created scan', async () => {
    const { project, user, scan, file } = await createAndSaveScan({
      userModel,
      fileModel,
      projectModel,
      scanModel
    })

    const token = await generateJWTToken(user)

    const { data } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .variables({
        name: scan.name,
        input_file_id: file.file_id,
        project_id: project.project_id
      })
      .expectNoErrors()

    expect(data).toMatchObject({
      create_scan: {
        scan_id: expect.any(Number),
        name: scan.name,
        input_file: {
          file_id: file.file_id,
          url: file.url
        },
        user: {
          user_id: user.user_id,
          name: user.name
        }
      }
    })
  })
})
