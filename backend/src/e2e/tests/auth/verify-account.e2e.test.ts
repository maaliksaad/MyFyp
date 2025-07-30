import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import { hash } from 'argon2'
import gql from 'graphql-tag'
import * as moment from 'moment'
import request from 'supertest-graphql'

import { createPopulatedUser, createPopulatedVerification } from '@/factories'
import { User, Verification } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'

const query = gql`
  mutation ($id: Int!, $token: String!) {
    verify_account(data: { id: $id, token: $token }) {
      user_id
      name
      email
      token
    }
  }
`

describe('Mutation: verify_account', () => {
  let app: INestApplication
  let userModel: typeof User
  let verificationModel: typeof Verification

  beforeAll(async () => {
    app = await createTestingApp()

    userModel = app.get<typeof User>(getModelToken(User))
    verificationModel = app.get<typeof Verification>(
      getModelToken(Verification)
    )

    await app.listen(0)
  })

  afterEach(async () => {
    await userModel.destroy({
      truncate: true
    })
    await verificationModel.destroy({
      truncate: true
    })
  })

  afterAll(async () => {
    await app.close()
  })

  it('given an invalid verification_id: should throw exception', async () => {
    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        id: 1,
        token: 'token'
      })

    expect(errors).toMatchObject([
      {
        message: 'Invalid account verification link'
      }
    ])
  })

  it('given an invalid token: should throw exception', async () => {
    const verification = createPopulatedVerification()

    await verificationModel.create({
      ...verification,
      token: await hash(verification.token)
    })

    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        id: verification.verification_id,
        token: 'token'
      })

    expect(errors).toMatchObject([
      {
        message: 'Invalid account verification link'
      }
    ])
  })

  it('given an expired token: should throw exception', async () => {
    const verification = createPopulatedVerification()

    await verificationModel.create({
      ...verification,
      token: await hash(verification.token),
      created_at: moment().subtract(1, 'day').toDate()
    })

    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        id: verification.verification_id,
        token: verification.token
      })

    expect(errors).toMatchObject([
      {
        message: 'Invalid account verification link'
      }
    ])
  })

  it('given valid data: should activate the account', async () => {
    const user = createPopulatedUser({ verified: false })
    await userModel.create({ ...user })

    const verification = createPopulatedVerification({ user_id: user.user_id })
    await verificationModel.create({
      ...verification,
      token: await hash(verification.token),
      created_at: moment().toDate()
    })

    const { data } = await request(app.getHttpServer())
      .query(query)
      .variables({
        id: verification.verification_id,
        token: verification.token
      })
      .expectNoErrors()

    expect(data).toMatchObject({
      verify_account: {
        user_id: expect.any(Number),
        name: user.name,
        email: user.email,
        token: expect.any(String)
      }
    })
  })
})
