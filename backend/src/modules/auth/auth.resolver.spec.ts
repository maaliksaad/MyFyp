import { faker } from '@faker-js/faker'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, type TestingModule } from '@nestjs/testing'
import * as argon2 from 'argon2'

import {
  createPopulatedPasswordReset,
  createPopulatedUser,
  createPopulatedVerification
} from '@/factories'
import { PasswordReset, User, Verification } from '@/models'
import { AuthResolver } from '@/modules/auth/auth.resolver'
import { AuthService } from '@/modules/auth/auth.service'
import { EmailService } from '@/modules/email/email.service'
import { createModelStub } from '@/tests/create-model.stub'

describe('AuthResolver', () => {
  let authResolver: AuthResolver
  let authService: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: createModelStub(User, Verification, PasswordReset),
      providers: [
        AuthResolver,
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
        JwtService
      ]
    }).compile()

    authResolver = module.get<AuthResolver>(AuthResolver)
    authService = module.get<AuthService>(AuthService)
  })

  it('resolver and service should be defined', async () => {
    expect(authResolver).toBeDefined()
    expect(authService).toBeDefined()
  })

  describe('login', () => {
    it('given an invalid email: should throw exception', async () => {
      const user = createPopulatedUser()

      jest.spyOn(authService, 'getUserWithEmail').mockResolvedValue(null)

      await expect(
        authResolver.login({ email: user.email, password: 'password' })
      ).rejects.toThrow('No user found with this email')
    })

    it('given a valid email: should return a user with token', async () => {
      const user = createPopulatedUser()
      const token = faker.string.alpha(32)

      jest.spyOn(authService, 'getUserWithEmail').mockResolvedValue(user)
      jest.spyOn(authService, 'verifyLogin').mockResolvedValue(user)
      jest.spyOn(authService, 'signToken').mockResolvedValue(token)

      const result = await authResolver.login({
        email: user.email,
        password: 'password'
      })

      expect(result).toMatchObject({ ...user, token })
    })
  })

  describe('signup', () => {
    it('given an email that is already used: should throw exception', async () => {
      const user = createPopulatedUser()

      jest.spyOn(authService, 'getUserWithEmail').mockResolvedValue(user)

      await expect(authResolver.signup(user)).rejects.toThrow(
        'User already exists with this email'
      )
    })

    it('given a valid user: should return the created user with token', async () => {
      const user = createPopulatedUser()
      const verification = createPopulatedVerification({
        user_id: user.user_id
      })

      jest.spyOn(authService, 'getUserWithEmail').mockResolvedValue(null)
      jest.spyOn(authService, 'createUser').mockResolvedValue(user)
      jest
        .spyOn(authService, 'sendVerifyAccountEmail')
        .mockResolvedValue(verification)

      const result = await authResolver.signup(user)

      expect(result).toMatchObject(verification)
    })
  })

  describe('verifyToken', () => {
    it('should return the user', async () => {
      const user = createPopulatedUser()

      jest.spyOn(authService, 'getPopulatedUser').mockResolvedValue(user)

      const result = await authResolver.verifyToken(user)

      expect(result).toMatchObject(user)
    })
  })

  describe('verifyAccount', () => {
    it('given valid data: should return the user and token', async () => {
      const user = createPopulatedUser()
      const verification = createPopulatedVerification({
        user_id: user.user_id
      })
      const token = faker.string.alpha(32)

      jest.spyOn(authService, 'verifyAccount').mockResolvedValue(verification)
      jest.spyOn(authService, 'getPopulatedUser').mockResolvedValue(user)
      jest.spyOn(authService, 'signToken').mockResolvedValue(token)

      const result = await authResolver.verifyAccount({
        id: verification.verification_id,
        token: verification.token
      })

      expect(result).toMatchObject({
        ...user,
        token
      })
    })
  })

  describe('forgotPassword', () => {
    it('given a valid email: should return the user and token', async () => {
      const user = createPopulatedUser()
      const passwordReset = createPopulatedPasswordReset({
        user_id: user.user_id
      })

      jest.spyOn(authService, 'getUserWithEmail').mockResolvedValue(user)
      jest
        .spyOn(authService, 'sendForgotPasswordEmail')
        .mockResolvedValue(passwordReset)

      const result = await authResolver.forgotPassword({ email: user.email })

      expect(result).toMatchObject(passwordReset)
    })

    it('given an invalid email: should throw exception', async () => {
      const user = createPopulatedUser()
      const passwordReset = createPopulatedPasswordReset({
        user_id: user.user_id
      })

      jest.spyOn(authService, 'getUserWithEmail').mockResolvedValue(null)
      jest
        .spyOn(authService, 'sendForgotPasswordEmail')
        .mockResolvedValue(passwordReset)

      await expect(
        authResolver.forgotPassword({ email: user.email })
      ).rejects.toThrow('No user found with this email')
    })
  })

  describe('resetPassword', () => {
    it('given valid data: should return the password reset', async () => {
      const user = createPopulatedUser()
      const passwordReset = createPopulatedPasswordReset({
        user_id: user.user_id
      })

      jest.spyOn(authService, 'resetPassword').mockResolvedValue(passwordReset)

      const result = await authResolver.resetPassword({
        id: passwordReset.password_reset_id,
        token: passwordReset.token,
        password: faker.internet.password()
      })

      expect(result).toMatchObject({
        ...passwordReset,
        token: expect.any(String)
      })
    })
  })

  describe('updateAccount', () => {
    it('given valid data: should return the updated user', async () => {
      const user = createPopulatedUser()
      const updatedUser = createPopulatedUser()

      jest.spyOn(authService, 'updateUser').mockResolvedValue()
      jest.spyOn(authService, 'getPopulatedUser').mockResolvedValue(updatedUser)

      const result = await authResolver.updateAccount(user, {
        name: updatedUser.name
      })

      expect(result).toMatchObject(updatedUser)
    })
  })

  describe('updatePassword', () => {
    it('given an invalid password: should throw exception', async () => {
      const user = createPopulatedUser()

      jest.spyOn(argon2, 'verify').mockResolvedValue(false)

      await expect(
        authResolver.updatePassword(user, {
          current_password: 'password',
          new_password: 'new_password'
        })
      ).rejects.toThrow('Invalid password')
    })

    it('given same password: should throw exception', async () => {
      const user = createPopulatedUser()

      jest.spyOn(argon2, 'verify').mockResolvedValue(true)

      await expect(
        authResolver.updatePassword(user, {
          current_password: 'password',
          new_password: 'password'
        })
      ).rejects.toThrow('New password cannot be same as old password')
    })

    it('given a valid password: should update the user', async () => {
      const user = createPopulatedUser()

      jest.spyOn(argon2, 'verify').mockResolvedValue(true)
      jest.spyOn(authService, 'getPopulatedUser').mockResolvedValue(user)

      const result = await authResolver.updatePassword(user, {
        current_password: 'password',
        new_password: 'new_password'
      })

      expect(result).toEqual(user)
    })
  })
})
