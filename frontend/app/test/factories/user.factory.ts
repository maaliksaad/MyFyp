import { faker } from '@faker-js/faker'

import { type User } from '~/graphql'

export const createPopulatedUser = ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  user_id = faker.number.int({ min: 1, max: 1000 }),
  name = faker.person.fullName(),
  email = faker.internet.email(),
  verified = faker.datatype.boolean(),
  picture = faker.image.url(),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  created_at = faker.date.recent().toISOString()
}: Partial<User> = {}): User => {
  return {
    user_id,
    name,
    email,
    verified,
    picture,
    created_at
  }
}
