import { faker } from '@faker-js/faker'

import { type Notification } from '~/graphql'

export const createPopulatedNotification = ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  notification_id = faker.number.int({ min: 1, max: 1000 }),
  title = faker.lorem.sentence(3),
  type = faker.helpers.arrayElement(['created', 'updated']),
  read = faker.datatype.boolean(),
  metadata = {},
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at = faker.date.recent().toISOString()
}: Partial<Notification> = {}): Notification => {
  return {
    notification_id,
    title,
    type,
    read,
    metadata,
    created_at
  }
}
