import type { INestApplication } from '@nestjs/common'
import { getModelToken } from '@nestjs/sequelize'
import * as request from 'supertest'

import { createPopulatedFile } from '@/factories'
import { File } from '@/models'
import { createTestingApp } from '@/tests/create-testing-app'

describe('GET /files/:key', () => {
  let app: INestApplication
  let fileModel: typeof File

  beforeAll(async () => {
    app = await createTestingApp()

    fileModel = app.get<typeof File>(getModelToken(File))

    await app.listen(0)
  })

  afterAll(async () => {
    await app.close()
  })

  it('given an invalid key: should throw an error', async () => {
    const file = createPopulatedFile()

    const response = await request(app.getHttpServer()).get(
      `/files/${file.key}`
    )

    expect(response.status).toEqual(404)
    expect(response.body).toMatchObject({
      error: 'File not found'
    })
  })

  it('given a valid key: should return the file', async () => {
    const file = createPopulatedFile()
    await fileModel.create({ ...file })

    const response = await request(app.getHttpServer()).get(
      `/files/${file.key}`
    )

    expect(response.status).toEqual(200)
    expect(response.body).toMatchObject({
      ...file,
      created_at: expect.any(String),
      updated_at: expect.any(String)
    })
  })
})
