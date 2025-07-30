import { type INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { generateJWTToken } from '@/e2e/util'
import { createPopulatedUser } from '@/factories'
import { User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'

const query = gql`
  query {
    verify_token {
      user_id
      name
      email
    }
  }
`

describe('Query: verify_token', () => {
  let app: INestApplication
  let userModel: typeof User

  beforeAll(async () => {
    app = await createTestingApp()

    userModel = app.get<typeof User>(getModelToken(User))

    await app.listen(0)
  })

  afterEach(async () => {
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

  it('given a logged in user: should return user data', async () => {
    const user = createPopulatedUser({
      verified: true
    })

    await userModel.create({
      ...user
    })

    const token = await generateJWTToken(user)

    const { data } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .expectNoErrors()

    expect(data).toMatchObject({
      verify_token: {
        user_id: user.user_id,
        name: user.name,
        email: user.email
      }
    })
  })
})
