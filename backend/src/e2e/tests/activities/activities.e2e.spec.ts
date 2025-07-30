import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import gql from 'graphql-tag'
import request from 'supertest-graphql'

import { generateJWTToken } from '@/e2e/util'
import { createPopulatedActivity, createPopulatedUser } from '@/factories'
import { Activity, User } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'

const query = gql`
  query ($project_slug: String, $scan_slug: String) {
    activities(project_slug: $project_slug, scan_slug: $scan_slug) {
      activity_id
      entity
      type
      metadata
    }
  }
`

describe('Query: activities', () => {
  let app: INestApplication
  let activityModel: typeof Activity
  let userModel: typeof User

  beforeAll(async () => {
    app = await createTestingApp()

    activityModel = app.get<typeof Activity>(getModelToken(Activity))
    userModel = app.get<typeof User>(getModelToken(User))

    await app.listen(0)
  })

  afterEach(async () => {
    await activityModel.destroy({
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

  it('given a logged in user with no activities: should return empty array', async () => {
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
      activities: []
    })
  })

  it('given a logged in user with activities: should return user projects', async () => {
    const user = createPopulatedUser({ verified: true })
    await userModel.create({ ...user })

    const activity = createPopulatedActivity({ user_id: user.user_id })
    await activityModel.create({ ...activity })

    const token = await generateJWTToken(user)

    const { data } = await request(app.getHttpServer())
      .set({
        Authorization: token
      })
      .query(query)
      .expectNoErrors()

    expect(data).toMatchObject({
      activities: [
        {
          activity_id: activity.activity_id,
          metadata: activity.metadata,
          entity: activity.entity,
          type: activity.type
        }
      ]
    })
  })
})
