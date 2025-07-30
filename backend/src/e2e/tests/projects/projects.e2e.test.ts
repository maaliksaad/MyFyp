import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { generateJWTToken } from '@/e2e/util'
import { createPopulatedUser } from '@/factories'
import { File, Project, User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'
import { createAndSaveProject } from '@/tests/util'

const query = gql`
  query {
    projects {
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

describe('Query: projects', () => {
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
    const { errors } = await request(app.getHttpServer()).query(query)

    expect(errors).toMatchObject([
      {
        message: 'Unauthorized'
      }
    ])
  })

  it('given a logged in user with no projects: should return empty array', async () => {
    const user = createPopulatedUser({
      verified: true
    })
    await userModel.create({ ...user })

    const token = await generateJWTToken(user)

    const { data } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .expectNoErrors()

    expect(data).toMatchObject({
      projects: []
    })
  })

  it('given a logged in user with projects: should return user projects', async () => {
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
      .expectNoErrors()

    expect(data).toMatchObject({
      projects: [
        {
          project_id: project.project_id,
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
      ]
    })
  })
})
