import { faker } from '@faker-js/faker'
import slugify from 'slugify'

import { type Scan } from '@/models'

export const createPopulatedScan = ({
  scan_id = faker.number.int({ min: 1, max: 1000 }),
  name = faker.person.fullName(),
  status = faker.helpers.arrayElement(['Failed', 'Completed', 'Preparing']),
  input_file_id = faker.number.int({ min: 1, max: 1000 }),
  project_id = faker.number.int({ min: 1, max: 1000 }),
  user_id = faker.number.int({ min: 1, max: 1000 }),
  created_at = faker.date.recent()
}: Partial<Scan> = {}): Scan => {
  return {
    scan_id,
    name,
    slug: slugify(name, { lower: true }),
    status,
    project_id,
    input_file_id,
    user_id,
    created_at
  } as Scan
}
