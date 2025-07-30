import { faker } from '@faker-js/faker'

import { type Activity } from '@/models'

export const createPopulatedActivity = ({
  activity_id = faker.number.int({ min: 1, max: 1000 }),
  entity = faker.helpers.arrayElement(['scan', 'project']),
  type = faker.helpers.arrayElement(['created', 'updated']),
  metadata = {},
  user_id = faker.number.int({ min: 1, max: 1000 }),
  created_at = faker.date.recent()
}: Partial<Activity> = {}): Activity => {
  return {
    activity_id,
    entity,
    type,
    metadata,
    user_id,
    created_at
  } as Activity
}
