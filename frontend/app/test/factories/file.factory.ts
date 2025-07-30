import { faker } from '@faker-js/faker'

import { type File } from '~/graphql'

export const createPopulatedFile = ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  file_id = faker.number.int({ min: 1, max: 1000 }),
  name = faker.system.fileName(),
  key = faker.string.alphanumeric({ length: 10 }),
  bucket = faker.lorem.word(),
  url = faker.internet.url(),
  type = faker.helpers.arrayElement(['Video', 'Image']),
  mimetype = faker.system.mimeType(),
  thumbnail = faker.image.url(),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at = faker.date.recent().toISOString()
}: Partial<File> = {}): File => {
  return {
    file_id,
    name,
    key,
    bucket,
    url,
    type,
    mimetype,
    thumbnail,
    created_at
  }
}
