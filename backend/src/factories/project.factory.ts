import { faker } from '@faker-js/faker'
import slugify from 'slugify'

import { type Project } from '@/models'

export const createPopulatedProject = ({
  project_id = faker.number.int({ min: 1, max: 1000 }),
  name = faker.lorem.word(),
  thumbnail_id = faker.number.int({ min: 1, max: 1000 }),
  user_id = faker.number.int({ min: 1, max: 1000 }),
  created_at = faker.date.recent()
}: Partial<Project> = {}): Project => {
  return {
    project_id,
    name,
    slug: slugify(name, { lower: true }),
    thumbnail_id,
    user_id,
    created_at
  } as Project
}
