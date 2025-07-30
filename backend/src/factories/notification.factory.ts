import { faker } from '@faker-js/faker'

import { type Notification } from '@/models'

export const createPopulatedNotification = ({
  notification_id = faker.number.int({ min: 1, max: 1000 }),
  title = faker.lorem.sentence(3),
  type = faker.helpers.arrayElement(['created', 'updated']),
  read = faker.datatype.boolean(),
  metadata = {},
  user_id = faker.number.int({ min: 1, max: 1000 }),
  created_at = faker.date.recent()
}: Partial<Notification> = {}): Notification => {
  return {
    notification_id,
    title,
    type,
    read,
    metadata,
    user_id,
    created_at
  } as Notification
}
