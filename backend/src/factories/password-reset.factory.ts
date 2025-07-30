import { faker } from '@faker-js/faker'

import { type PasswordReset } from '@/models'

export const createPopulatedPasswordReset = ({
  password_reset_id = faker.number.int({ min: 1, max: 1000 }),
  token = faker.string.alphanumeric(12),
  user_id = faker.number.int({ min: 1, max: 1000 }),
  created_at = faker.date.recent()
}: Partial<PasswordReset> = {}): PasswordReset => {
  return {
    password_reset_id,
    token,
    user_id,
    created_at
  } as PasswordReset
}
