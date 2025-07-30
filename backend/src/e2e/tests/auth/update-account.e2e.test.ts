import { faker } from '@faker-js/faker'
import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { generateJWTToken } from '@/e2e/util'
import { createPopulatedUser } from '@/factories'
import { User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'

const query = gql`
  mutation ($name: String, $picture: String) {
    update_account(data: { name: $name, picture: $picture }) {
      user_id
      name
      email
      picture
    }
  }
`

describe('Mutation: update_account', () => {
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

  it('given valid data: should update the account', async () => {
    const user = createPopulatedUser({
      verified: true
    })

    await userModel.create({
      ...user
    })

    const token = await generateJWTToken(user)

    const updates = {
      name: faker.person.fullName(),
      picture: faker.image.avatar()
    }

    const { data } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .variables({
        name: updates.name,
        picture: updates.picture
      })
      .expectNoErrors()

    expect(data).toMatchObject({
      update_account: {
        user_id: expect.any(Number),
        name: updates.name,
        email: user.email,
        picture: updates.picture
      }
    })
  })
})
