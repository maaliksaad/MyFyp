import { faker } from '@faker-js/faker'

import { type Verification } from '@/models'

export const createPopulatedVerification = ({
  verification_id = faker.number.int({ min: 1, max: 1000 }),
  token = faker.string.alphanumeric(12),
  user_id = faker.number.int({ min: 1, max: 1000 }),
  created_at = faker.date.recent()
}: Partial<Verification> = {}): Verification => {
  return {
    verification_id,
    token,
    user_id,
    created_at
  } as Verification
}
