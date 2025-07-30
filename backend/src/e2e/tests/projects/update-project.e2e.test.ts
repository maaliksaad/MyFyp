import { faker } from '@faker-js/faker'
import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { generateJWTToken } from '@/e2e/util'
import { createPopulatedProject, createPopulatedUser } from '@/factories'
import { File, Project, User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'
import { createAndSaveProject } from '@/tests/util'

const query = gql`
  mutation ($id: Int!, $name: String!) {
    update_project(id: $id, data: { name: $name }) {
      project_id
      name
      thumbnail {
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

describe('Mutation: update_project', () => {
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
        id: 1,
        name: ''
      })

    expect(errors).toMatchObject([
      {
        message: 'Unauthorized'
      }
    ])
  })

  it('given a logged in user and invalid id: should throw an error', async () => {
    const user = createPopulatedUser({
      verified: true
    })
    await userModel.create({ ...user })

    const token = await generateJWTToken(user)

    const project = createPopulatedProject()

    const { errors } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .variables({
        id: project.project_id,
        name: ''
      })

    expect(errors).toMatchObject([
      {
        message: 'Project not found'
      }
    ])
  })

  it('given a logged in user and valid data: should return the updated project', async () => {
    const { project, user, thumbnail } = await createAndSaveProject({
      userModel,
      fileModel,
      projectModel
    })

    const token = await generateJWTToken(user)

    const updateProject = {
      id: project.project_id,
      name: faker.lorem.words(3)
    }

    const { data } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .variables(updateProject)
      .expectNoErrors()

    expect(data).toMatchObject({
      update_project: {
        project_id: project.project_id,
        name: updateProject.name,
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
