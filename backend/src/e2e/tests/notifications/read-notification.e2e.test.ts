import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { generateJWTToken } from '@/e2e/util'
import { createPopulatedNotification, createPopulatedUser } from '@/factories'
import { Notification, User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'

const query = gql`
  mutation {
    read_notifications {
      notification_id
      title
      type
      read
      metadata
      created_at
    }
  }
`

describe('Mutation: read_notifications', () => {
  let app: INestApplication
  let userModel: typeof User
  let notificationModel: typeof Notification

  beforeAll(async () => {
    app = await createTestingApp()

    userModel = app.get<typeof User>(getModelToken(User))
    notificationModel = app.get<typeof Notification>(
      getModelToken(Notification)
    )

    await app.listen(0)
  })

  afterEach(async () => {
    await notificationModel.destroy({
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

  it('given a logged in user with no notifications: should return empty array', async () => {
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
      read_notifications: []
    })
  })

  it('given a logged in user with notifications: should mark the notifications as read', async () => {
    const user = createPopulatedUser({
      verified: true
    })
    await userModel.create({ ...user })

    const notification = createPopulatedNotification({
      user_id: user.user_id,
      read: false
    })
    await notificationModel.create({ ...notification })

    const token = await generateJWTToken(user)

    const { data } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .expectNoErrors()

    expect(data).toMatchObject({
      read_notifications: [
        {
          notification_id: notification.notification_id,
          title: notification.title,
          type: notification.type,
          read: true,
          metadata: notification.metadata
        }
      ]
    })
  })
})
