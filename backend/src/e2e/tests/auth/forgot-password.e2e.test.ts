import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { createPopulatedUser } from '@/factories'
import { User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'

const query = gql`
  mutation ($email: String!) {
    forgot_password(data: { email: $email }) {
      password_reset_id
    }
  }
`

describe('Mutation: forgot_password', () => {
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

  it('given an invalid email: should throw exception', async () => {
    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        email: ''
      })

    expect(errors).toMatchObject([
      {
        message: {
          email: ['email address is invalid', 'email should not be empty']
        }
      }
    ])
  })

  it('given unregistered email: should throw exception', async () => {
    const user = createPopulatedUser()

    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        email: user.email
      })

    expect(errors).toMatchObject([
      {
        message: 'No user found with this email'
      }
    ])
  })

  it('given a valid email: should send the reset password link', async () => {
    const user = createPopulatedUser({ verified: true })
    await userModel.create({ ...user })

    const { data } = await request(app.getHttpServer())
      .query(query)
      .variables({
        email: user.email
      })
      .expectNoErrors()

    expect(data).toMatchObject({
      forgot_password: {
        password_reset_id: expect.any(Number)
      }
    })
  })
})
