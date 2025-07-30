import { type INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import { hash } from 'argon2'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { createPopulatedUser } from '@/factories'
import { User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'

const query = gql`
  mutation ($email: String!, $password: String!) {
    login(data: { email: $email, password: $password }) {
      user_id
      name
      email
      token
    }
  }
`

describe('Mutation: login', () => {
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

  it('given an invalid body: should throw bad request exception', async () => {
    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        email: '',
        password: ''
      })

    expect(errors).toMatchObject([
      {
        message: {
          email: ['email address is invalid', 'email should not be empty'],
          password: 'password should not be empty'
        }
      }
    ])
  })

  it('given an email that does not exists: should throw an error', async () => {
    const user = createPopulatedUser()

    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        email: user.email,
        password: user.password
      })

    expect(errors).toMatchObject([
      {
        message: 'No user found with this email'
      }
    ])
  })

  it('given an email that exists but the password is incorrect: should throw an error', async () => {
    const user = createPopulatedUser({
      verified: true
    })

    await userModel.create({
      ...user,
      password: await hash(user.password)
    })

    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        email: user.email,
        password: 'invalid-password'
      })

    expect(errors).toMatchObject([
      {
        message: 'Incorrect password'
      }
    ])
  })

  it('given an email that exists but the user is not verified: should throw an error', async () => {
    const user = createPopulatedUser({
      verified: false
    })

    await userModel.create({
      ...user,
      password: await hash(user.password)
    })

    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        email: user.email,
        password: user.password
      })

    expect(errors).toMatchObject([
      {
        message: 'You need to verify your account first, check your email'
      }
    ])
  })

  it('given a valid email and password: should return the created user and token', async () => {
    const user = createPopulatedUser({
      verified: true
    })

    await userModel.create({
      ...user,
      password: await hash(user.password)
    })

    const { data } = await request(app.getHttpServer())
      .query(query)
      .variables({
        email: user.email,
        password: user.password
      })
      .expectNoErrors()

    expect(data).toMatchObject({
      login: {
        user_id: expect.any(Number),
        name: user.name,
        email: user.email,
        token: expect.any(String)
      }
    })
  })
})
