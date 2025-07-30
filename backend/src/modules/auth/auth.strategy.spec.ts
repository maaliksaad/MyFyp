import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { getModelToken } from '@nestjs/sequelize'
import { Test, type TestingModule } from '@nestjs/testing'

import { createPopulatedUser } from '@/factories'
import { PasswordReset, User, Verification } from '@/models'
import { AuthService } from '@/modules/auth/auth.service'
import { AuthStrategy } from '@/modules/auth/auth.strategy'
import { EmailService } from '@/modules/email/email.service'
import { createModelStub } from '@/tests/create-model.stub'

describe('AuthStrategy', () => {
  let authStrategy: AuthStrategy
  let userModel: typeof User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: createModelStub(User, Verification, PasswordReset),
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('key'),
            getOrThrow: jest.fn().mockReturnValue('key')
          }
        },
        {
          provide: EmailService,
          useValue: {
            send: jest.fn()
          }
        },
        JwtService,
        AuthStrategy
      ]
    }).compile()

    authStrategy = module.get<AuthStrategy>(AuthStrategy)
    userModel = module.get<typeof User>(getModelToken(User))
  })

  it('strategy and model should be defined', () => {
    expect(authStrategy).toBeDefined()
    expect(userModel).toBeDefined()
  })

  describe('validate', () => {
    it('given an invalid email: should return null', async () => {
      const user = createPopulatedUser({
        verified: true
      })

      const result = await authStrategy.validate({ email: user.email })

      expect(result).toBeNull()
    })

    it('given a valid email: should return a user', async () => {
      const user = createPopulatedUser({
        verified: true
      })

      await userModel.create({
        ...user
      })

      const result = await authStrategy.validate({ email: user.email })

      expect(result).toBeDefined()
      expect(result).toHaveProperty('name', user.name)
      expect(result).toHaveProperty('email', user.email)
      expect(result).toHaveProperty('password')
      expect(result).toHaveProperty('created_at')
      expect(result).toHaveProperty('updated_at')
    })
  })
})
