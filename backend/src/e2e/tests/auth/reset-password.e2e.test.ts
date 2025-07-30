import { faker } from '@faker-js/faker'
import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import { hash, verify } from 'argon2'
import gql from 'graphql-tag'
import * as moment from 'moment'
import request from 'supertest-graphql'

import { createPopulatedPasswordReset, createPopulatedUser } from '@/factories'
import { PasswordReset, User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'

const query = gql`
  mutation ($id: Int!, $token: String!, $password: String!) {
    reset_password(data: { id: $id, token: $token, password: $password }) {
      password_reset_id
    }
  }
`

describe('Mutation: reset_password', () => {
  let app: INestApplication
  let userModel: typeof User
  let passwordResetModel: typeof PasswordReset

  beforeAll(async () => {
    app = await createTestingApp()

    userModel = app.get<typeof User>(getModelToken(User))
    passwordResetModel = app.get<typeof PasswordReset>(
      getModelToken(PasswordReset)
    )

    await app.listen(0)
  })

  afterEach(async () => {
    await userModel.destroy({
      truncate: true
    })
    await passwordResetModel.destroy({
      truncate: true
    })
  })

  afterAll(async () => {
    await app.close()
  })

  it('given an invalid password_reset_id: should throw exception', async () => {
    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        id: 1,
        token: 'token',
        password: 'password'
      })

    expect(errors).toMatchObject([
      {
        message: 'Invalid password reset link'
      }
    ])
  })

  it('given an invalid token: should throw exception', async () => {
    const passwordReset = createPopulatedPasswordReset()

    await passwordResetModel.create({
      ...passwordReset,
      token: await hash(passwordReset.token)
    })

    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        id: passwordReset.password_reset_id,
        token: 'token',
        password: 'password'
      })

    expect(errors).toMatchObject([
      {
        message: 'Invalid password reset link'
      }
    ])
  })

  it('given an expired token: should throw exception', async () => {
    const passwordReset = createPopulatedPasswordReset()

    await passwordResetModel.create({
      ...passwordReset,
      token: await hash(passwordReset.token),
      created_at: moment().subtract(1, 'day').toDate()
    })

    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        id: passwordReset.password_reset_id,
        token: passwordReset.token,
        password: 'password'
      })

    expect(errors).toMatchObject([
      {
        message: 'Invalid password reset link'
      }
    ])
  })

  it('given valid data: should reset the account password', async () => {
    const user = createPopulatedUser({ verified: false })
    await userModel.create({ ...user })

    const passwordReset = createPopulatedPasswordReset({
      user_id: user.user_id
    })
    await passwordResetModel.create({
      ...passwordReset,
      token: await hash(passwordReset.token),
      created_at: moment().toDate()
    })

    const updatedPassword = faker.internet.password()

    const { data } = await request(app.getHttpServer())
      .query(query)
      .variables({
        id: passwordReset.password_reset_id,
        token: passwordReset.token,
        password: updatedPassword
      })
      .expectNoErrors()

    const updatedUser = await userModel.findByPk(user.user_id)

    expect(data).toMatchObject({
      reset_password: {
        password_reset_id: expect.any(Number)
      }
    })
    expect(updatedUser).not.toBeNull()
    expect(await verify(updatedUser?.password ?? '', updatedPassword)).toBe(
      true
    )
  })
})
