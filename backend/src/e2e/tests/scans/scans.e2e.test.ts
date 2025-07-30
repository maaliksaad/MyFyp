import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { generateJWTToken } from '@/e2e/util'
import { createPopulatedUser } from '@/factories'
import { File, Project, Scan, User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'
import { createAndSaveScan } from '@/tests/util'

const query = gql`
  query {
    scans {
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

describe('Query: scans', () => {
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
    const { errors } = await request(app.getHttpServer()).query(query)

    expect(errors).toMatchObject([
      {
        message: 'Unauthorized'
      }
    ])
  })

  it('given a logged in user with no scans: should return empty array', async () => {
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
      scans: []
    })
  })

  it('given a logged in user with scans: should return user scans', async () => {
    const { user, scan, file } = await createAndSaveScan({
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
      .expectNoErrors()

    expect(data).toMatchObject({
      scans: [
        {
          scan_id: scan.scan_id,
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
      ]
    })
  })
})
