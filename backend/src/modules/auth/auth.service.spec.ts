import { faker } from '@faker-js/faker'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { getConnectionToken, getModelToken } from '@nestjs/sequelize'
import { Test, type TestingModule } from '@nestjs/testing'
import { hash, verify } from 'argon2'
import * as moment from 'moment'
import { type Sequelize } from 'sequelize'

import {
  createPopulatedPasswordReset,
  createPopulatedUser,
  createPopulatedVerification
} from '@/factories'
import { PasswordReset, User, Verification } from '@/models'
import { AuthService } from '@/modules/auth/auth.service'
import { EmailService } from '@/modules/email/email.service'
import { createModelStub } from '@/tests/create-model.stub'

describe('AuthService', () => {
  let authService: AuthService
  let userModel: typeof User
  let verificationModel: typeof Verification
  let passwordResetModel: typeof PasswordReset
  let sequelize: Sequelize

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
        JwtService
      ]
    }).compile()

    authService = module.get<AuthService>(AuthService)
    userModel = module.get<typeof User>(getModelToken(User))
    passwordResetModel = module.get<typeof PasswordReset>(
      getModelToken(PasswordReset)
    )
    verificationModel = module.get<typeof Verification>(
      getModelToken(Verification)
    )
    sequelize = module.get<Sequelize>(getConnectionToken())
  })

  afterEach(async () => {
    await userModel.destroy({ where: {} })
    await verificationModel.destroy({ where: {} })
    await passwordResetModel.destroy({ where: {} })
  })

  it('should be defined', async () => {
    expect(authService).toBeDefined()
    expect(userModel).toBeDefined()
    expect(verificationModel).toBeDefined()
    expect(passwordResetModel).toBeDefined()
  })

  describe('getPopulatedUser', () => {
    it('given an invalid user_id: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      await expect(
        authService.getPopulatedUser({ user_id: 1 }, transaction)
      ).rejects.toThrow('User not found')
    })

    it('given a non verified user: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      const populatedUser = createPopulatedUser({
        verified: false
      })

      const user = await userModel.create({
        ...populatedUser
      })

      await expect(
        authService.getPopulatedUser({ user_id: user.user_id }, transaction)
      ).rejects.toThrow('User is not verified')
    })

    it('given a valid user_id: should return a user', async () => {
      const transaction = await sequelize.transaction()

      const populatedUser = createPopulatedUser({
        verified: true
      })

      const user = await userModel.create({
        ...populatedUser
      })

      const result = await authService.getPopulatedUser(
        { user_id: user.user_id },
        transaction
      )

      expect(result).not.toBeNull()
      expect(result).toMatchObject(populatedUser)
    })
  })

  describe('getUserWithEmail', () => {
    it('given an invalid email: should return null', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser()

      const result = await authService.getUserWithEmail(
        { email: user.email },
        transaction
      )

      expect(result).toBeNull()
    })

    it('given a valid email: should return a user', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser()

      await userModel.create({
        ...user
      })

      const result = await authService.getUserWithEmail(
        { email: user.email },
        transaction
      )

      expect(result).not.toBeNull()
      expect(result).toMatchObject(user)
    })
  })

  describe('createUser', () => {
    it('given a valid user: should return a user', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser({
        verified: false
      })

      const result = await authService.createUser(
        {
          data: { name: user.name, email: user.email, password: user.password }
        },
        transaction
      )

      expect(result).not.toBeNull()
      expect(result).toMatchObject({
        ...user,
        picture: `https://ui-avatars.com/api/?background=4f46e5&color=fff&name=${user.name}`,
        user_id: expect.any(Number),
        created_at: expect.any(Date),
        password: expect.any(String)
      })
    })
  })

  describe('verifyLogin', () => {
    it('given an non verified user: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      const populatesUser = createPopulatedUser({
        verified: false
      })

      const user = await userModel.create({
        ...populatesUser,
        password: await hash(populatesUser.password)
      })

      await expect(
        authService.verifyLogin(
          {
            data: { email: user.email, password: populatesUser.password },
            user
          },
          transaction
        )
      ).rejects.toThrow(
        'You need to verify your account first, check your email'
      )
    })

    it('given an incorrect password: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      const populatesUser = createPopulatedUser()

      const user = await userModel.create({
        ...populatesUser,
        password: await hash(populatesUser.password)
      })

      await expect(
        authService.verifyLogin(
          { data: { email: user.email, password: 'incorrect' }, user },
          transaction
        )
      ).rejects.toThrow('Incorrect password')
    })

    it('given a valid user: should return a user', async () => {
      const transaction = await sequelize.transaction()

      const populatesUser = createPopulatedUser({
        verified: true
      })

      const user = await userModel.create({
        ...populatesUser,
        password: await hash(populatesUser.password)
      })

      const result = await authService.verifyLogin(
        { data: { email: user.email, password: populatesUser.password }, user },
        transaction
      )

      expect(result).not.toBeNull()
      expect(result).toMatchObject(user)
    })
  })

  describe('signToken', () => {
    it('given a valid user: should return a token', async () => {
      const populatedUser = createPopulatedUser()

      const user = await userModel.create({
        ...populatedUser
      })

      const result = await authService.signToken(user)

      expect(result).not.toBeNull()
      expect(typeof result).toBe('string')
    })
  })

  describe('sendVerifyAccountEmail', () => {
    it('given a user: should send the verify account email', async () => {
      const transaction = await sequelize.transaction()

      const populatesUser = createPopulatedUser({
        verified: true
      })

      const user = await userModel.create({
        ...populatesUser,
        password: await hash(populatesUser.password)
      })

      const verification = await authService.sendVerifyAccountEmail(
        { user },
        transaction
      )

      expect(verification).toMatchObject({
        verification_id: expect.any(Number),
        token: expect.any(String),
        user_id: user.user_id,
        created_at: expect.any(Date)
      })
    })
  })

  describe('updateUser', () => {
    it('given valid data: should update the user', async () => {
      const transaction = await sequelize.transaction()

      const populatesUser = createPopulatedUser({
        verified: true
      })

      const user = await userModel.create({
        ...populatesUser,
        password: await hash(populatesUser.password)
      })

      const updates = {
        name: faker.person.fullName()
      }

      await authService.updateUser(
        { id: user.user_id, data: updates },
        transaction
      )

      const updatedUser = await userModel.findByPk(user.user_id)

      expect(updatedUser).not.toBeNull()
      expect(updatedUser?.name).toEqual(updates.name)
    })
  })

  describe('verifyAccount', () => {
    it('given an invalid verification id: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      await expect(
        authService.verifyAccount(
          {
            data: {
              id: 1,
              token: ''
            }
          },
          transaction
        )
      ).rejects.toThrow('Invalid account verification link')
    })

    it('given an invalid token: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      const verification = createPopulatedVerification({
        created_at: moment().toDate()
      })

      await verificationModel.create({
        ...verification,
        token: await hash(verification.token)
      })

      await expect(
        authService.verifyAccount(
          {
            data: {
              id: verification.verification_id,
              token: ''
            }
          },
          transaction
        )
      ).rejects.toThrow('Invalid account verification link')
    })

    it('given an expired token: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      const verification = createPopulatedVerification({
        created_at: moment().subtract(1, 'day').toDate()
      })

      await verificationModel.create({
        ...verification,
        token: await hash(verification.token)
      })

      await expect(
        authService.verifyAccount(
          {
            data: {
              id: verification.verification_id,
              token: verification.token
            }
          },
          transaction
        )
      ).rejects.toThrow('Invalid account verification link')
    })

    it('given valid data: should verify the account', async () => {
      const transaction = await sequelize.transaction()

      const user = await userModel.create({
        ...createPopulatedUser({ verified: false })
      })

      const verification = createPopulatedVerification({
        user_id: user.user_id,
        created_at: moment().toDate()
      })
      await verificationModel.create({
        ...verification,
        token: await hash(verification.token)
      })

      const result = await authService.verifyAccount(
        {
          data: {
            id: verification.verification_id,
            token: verification.token
          }
        },
        transaction
      )

      const updatedUser = await userModel.findByPk(user.user_id)

      expect(result).toMatchObject({
        verification_id: verification.verification_id,
        token: expect.any(String)
      })
      expect(updatedUser).not.toBeNull()
      expect(updatedUser?.verified).toBeTruthy()
    })
  })

  describe('sendForgotPasswordEmail', () => {
    it('given a user: should send the verify account email', async () => {
      const transaction = await sequelize.transaction()

      const populatesUser = createPopulatedUser({
        verified: true
      })

      const user = await userModel.create({
        ...populatesUser,
        password: await hash(populatesUser.password)
      })

      const result = await authService.sendForgotPasswordEmail(
        { user },
        transaction
      )

      expect(result).toMatchObject({
        password_reset_id: expect.any(Number),
        token: expect.any(String),
        user_id: user.user_id,
        created_at: expect.any(Date)
      })
    })

    it('given a request sent within last 3 minutes: should throw error', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser({
        verified: true
      })

      await userModel.create({
        ...user,
        password: await hash(user.password)
      })

      const passwordReset = createPopulatedPasswordReset({
        user_id: user.user_id,
        created_at: moment().add(3, 'minutes').toDate()
      })

      await passwordResetModel.create({
        ...passwordReset,
        token: await hash(passwordReset.token)
      })

      const result = authService.sendForgotPasswordEmail({ user }, transaction)

      await expect(result).rejects.toThrow(
        'Wait for 3 minutes before requesting again'
      )
    })
  })

  describe('resetPassword', () => {
    it('given an invalid password reset id: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      await expect(
        authService.resetPassword(
          {
            data: {
              id: 1,
              token: '',
              password: ''
            }
          },
          transaction
        )
      ).rejects.toThrow('Invalid password reset link')
    })

    it('given an invalid token: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      const passwordReset = createPopulatedPasswordReset({
        created_at: moment().toDate()
      })

      await passwordResetModel.create({
        ...passwordReset,
        token: await hash(passwordReset.token)
      })

      await expect(
        authService.resetPassword(
          {
            data: {
              id: passwordReset.password_reset_id,
              token: '',
              password: ''
            }
          },
          transaction
        )
      ).rejects.toThrow('Invalid password reset link')
    })

    it('given an expired token: should throw an error', async () => {
      const transaction = await sequelize.transaction()

      const passwordReset = createPopulatedPasswordReset({
        created_at: moment().subtract(1, 'day').toDate()
      })

      await passwordResetModel.create({
        ...passwordReset,
        token: await hash(passwordReset.token)
      })

      await expect(
        authService.resetPassword(
          {
            data: {
              id: passwordReset.password_reset_id,
              token: passwordReset.token,
              password: ''
            }
          },
          transaction
        )
      ).rejects.toThrow('Invalid password reset link')
    })

    it('given valid data: should reset the account password', async () => {
      const transaction = await sequelize.transaction()

      const user = createPopulatedUser({ verified: true })

      await userModel.create({
        ...user,
        password: await hash(user.password)
      })

      const passwordReset = createPopulatedPasswordReset({
        user_id: user.user_id,
        created_at: moment().toDate()
      })
      await passwordResetModel.create({
        ...passwordReset,
        token: await hash(passwordReset.token)
      })

      const updatedPassword = faker.internet.password()

      const result = await authService.resetPassword(
        {
          data: {
            id: passwordReset.password_reset_id,
            token: passwordReset.token,
            password: updatedPassword
          }
        },
        transaction
      )

      expect(result).toMatchObject({
        password_reset_id: passwordReset.password_reset_id,
        token: expect.any(String)
      })

      const updatedUser = await userModel.findByPk(user.user_id)

      expect(updatedUser).not.toBeNull()
      expect(
        await verify(updatedUser?.password ?? '', updatedPassword)
      ).not.toEqual(user.password)
    })
  })
})
