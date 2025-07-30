import { faker } from '@faker-js/faker'

import { type Activity } from '~/graphql'

export const createPopulatedActivity = ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  activity_id = faker.number.int({ min: 1, max: 1000 }),
  // @ts-expect-error - Enum to string
  entity = faker.helpers.arrayElement(['scan', 'project']),
  type = faker.helpers.arrayElement(['created', 'updated']),
  metadata = {},
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at = faker.date.recent().toISOString()
}: Partial<Activity> = {}): Activity => {
  return {
    activity_id,
    entity,
    type,
    metadata,
    created_at
  }
}
