import { sign } from 'jsonwebtoken'

import { type User } from '@/models'

export const generateJWTToken = async (user: User) => {
  const { user_id, email } = user

  const token = sign(
    { id: user_id, email },
    process.env.JWT_SECRET ?? 'JWT_SECRET',
    {
      expiresIn: '1d'
    }
  )

  return `Bearer ${token}`
}
