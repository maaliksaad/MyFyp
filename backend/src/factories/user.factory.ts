import { faker } from '@faker-js/faker'

import { type User } from '@/models'

export const createPopulatedUser = ({
  user_id = faker.number.int({ min: 1, max: 1000 }),
  name = faker.person.fullName(),
  email = faker.internet.email(),
  password = faker.internet.password(),
  picture = faker.image.avatar(),
  verified = faker.datatype.boolean(),
  created_at = faker.date.recent()
}: Partial<User> = {}): User => {
  return {
    user_id,
    name,
    email,
    password,
    picture,
    verified,
    created_at
  } as User
}
