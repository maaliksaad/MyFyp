import { type INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { createPopulatedUser } from '@/factories'
import { User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'

const query = gql`
  mutation ($name: String!, $email: String!, $password: String!) {
    signup(data: { name: $name, email: $email, password: $password }) {
      verification_id
    }
  }
`

describe('Mutation: signup', () => {
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
        name: '',
        email: '',
        password: ''
      })

    expect(errors).toMatchObject([
      {
        message: {
          name: 'name should not be empty',
          email: ['email address is invalid', 'email should not be empty'],
          password: 'password should not be empty'
        }
      }
    ])
  })

  it('given an email that already exists: should throw an error', async () => {
    const user = createPopulatedUser()

    await userModel.create({
      ...user
    })

    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables({
        name: user.name,
        email: user.email,
        password: user.password
      })

    expect(errors).toMatchObject([
      {
        message: 'User already exists with this email'
      }
    ])
  })

  it('given a valid email: should return the verification', async () => {
    const user = createPopulatedUser()

    const { data } = await request(app.getHttpServer())
      .query(query)
      .variables({
        name: user.name,
        email: user.email,
        password: user.password
      })
      .expectNoErrors()

    expect(data).toMatchObject({
      signup: {
        verification_id: expect.any(Number)
      }
    })
  })
})
