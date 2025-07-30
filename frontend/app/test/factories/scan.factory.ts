import { faker } from '@faker-js/faker'

import { type Scan } from '~/graphql'
import { createPopulatedFile } from '~/test/factories/file.factory'
import { createPopulatedUser } from '~/test/factories/user.factory'

export const createPopulatedScan = ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  scan_id = faker.number.int({ min: 1, max: 1000 }),
  name = faker.person.fullName(),
  slug = faker.lorem.slug(),
  // @ts-expect-error - Enum to string
  status = faker.helpers.arrayElement(['Failed', 'Completed', 'Preparing']),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  input_file = createPopulatedFile(),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  splat_file = createPopulatedFile(),
  user = createPopulatedUser(),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at = faker.date.recent().toISOString()
}: Partial<Scan> = {}): Scan => {
  return {
    scan_id,
    name,
    status,
    slug,
    input_file,
    splat_file,
    user,
    created_at
  }
}
