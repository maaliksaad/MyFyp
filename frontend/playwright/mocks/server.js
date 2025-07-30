import { expressMiddleware } from '@apollo/server/express4'
import { faker } from '@faker-js/faker'
import cors from 'cors'
import express from 'express'

import { apollo } from './apollo.js'
import { tus } from './tus.js'

const app = express()

await apollo.start()

app.use(
  cors({
    exposedHeaders:
      'Authorization, Content-Type, Location, Tus-Extension, Tus-Max-Size, Tus-Resumable, Tus-Version, Upload-Concat, Upload-Defer-Length, Upload-Length, Upload-Metadata, Upload-Offset, X-HTTP-Method-Override, X-Requested-With, X-Forwarded-Host, X-Forwarded-Proto, Forwarded'
  })
)

app.post('/files', tus)
app.patch('/files/:id', tus)

app.get('/files/:id', (_, response) => {
  response.json({
    file_id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.system.fileName(),
    key: faker.string.alphanumeric({ length: 10 }),
    bucket: faker.lorem.word(),
    url: faker.internet.url(),
    type: faker.helpers.arrayElement(['Video', 'Image']),
    mimetype: faker.system.mimeType(),
    thumbnail: faker.image.url()
  })
})

app.use('/graphql', express.json(), expressMiddleware(apollo))

app.listen(8080, () => {
  console.log(`Server is running on http://localhost:8080`)
})
