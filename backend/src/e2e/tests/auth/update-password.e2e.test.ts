import { faker } from '@faker-js/faker'
import { type INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import { hash } from 'argon2'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { generateJWTToken } from '@/e2e/util'
import { createPopulatedUser } from '@/factories'
import { User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'

const query = gql`
  mutation ($current_password: String!, $new_password: String!) {
    update_password(
      data: { current_password: $current_password, new_password: $new_password }
    ) {
      user_id
      name
      email
    }
  }
`

describe('Mutation: update_password', () => {
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
    const updates = {
      current_password: faker.internet.password(),
      new_password: faker.internet.password()
    }

    const { errors } = await request(app.getHttpServer())
      .query(query)
      .variables(updates)

    expect(errors).toMatchObject([
      {
        message: 'Unauthorized'
      }
    ])
  })

  it('given a logged in user and invalid password: should throw an error', async () => {
    const user = createPopulatedUser({
      verified: true
    })

    await userModel.create({
      ...user,
      password: await hash(faker.internet.password())
    })

    const token = await generateJWTToken(user)

    const updates = {
      current_password: user.password + faker.internet.password(),
      new_password: faker.internet.password()
    }

    const { errors } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .variables(updates)

    expect(errors).toMatchObject([
      {
        message: 'Invalid password'
      }
    ])
  })

  it('given a logged in user and new password is same as old password: should throw an error', async () => {
    const user = createPopulatedUser({
      verified: true
    })

    await userModel.create({
      ...user,
      password: await hash(user.password)
    })

    const token = await generateJWTToken(user)

    const updates = {
      current_password: user.password,
      new_password: user.password
    }

    const { errors } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .variables(updates)

    expect(errors).toMatchObject([
      {
        message: 'New password cannot be same as old password'
      }
    ])
  })

  it('given a logged in user: should return user data', async () => {
    const user = createPopulatedUser({
      verified: true
    })

    await userModel.create({
      ...user,
      password: await hash(user.password)
    })

    const token = await generateJWTToken(user)

    const updates = {
      current_password: user.password,
      new_password: faker.internet.password()
    }

    const { data } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .variables(updates)
      .expectNoErrors()

    expect(data).toMatchObject({
      update_password: {
        user_id: user.user_id,
        email: user.email
      }
    })
  })
})
