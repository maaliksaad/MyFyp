import { faker } from '@faker-js/faker'

import { type Project } from '~/graphql'
import { createPopulatedFile } from '~/test/factories/file.factory'
import { createPopulatedScan } from '~/test/factories/scan.factory'
import { createPopulatedUser } from '~/test/factories/user.factory'

export const createPopulatedProject = ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  project_id = faker.number.int({ min: 1, max: 1000 }),
  name = faker.person.fullName(),
  thumbnail = createPopulatedFile(),
  scans = [createPopulatedScan()],
  slug = faker.lorem.slug(),
  user = createPopulatedUser(),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at = faker.date.recent().toISOString()
}: Partial<Project> = {}): Project => {
  return {
    project_id,
    name,
    thumbnail,
    scans,
    slug,
    user,
    created_at
  }
}
