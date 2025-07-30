import { ForbiddenError, UserInputError } from '@nestjs/apollo'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/sequelize'
import { hash, verify } from 'argon2'
import * as moment from 'moment'
import { generate } from 'randomstring'
import { Op, type Transaction } from 'sequelize'

import { PasswordReset, User, Verification } from '@/models'
import {
  type LoginDto,
  type ResetPasswordDto,
  type SignupDto,
  type VerifyAccountDto
} from '@/modules/auth/dtos'
import { EmailService } from '@/modules/email/email.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Verification)
    private readonly verificationModel: typeof Verification,
    @InjectModel(PasswordReset)
    private readonly passwordResetModel: typeof PasswordReset
  ) {}

  async getPopulatedUser(
    { user_id }: { user_id: number },
    transaction: Transaction
  ): Promise<User> {
    const user = await this.userModel.findOne({
      where: {
        user_id
      },
      include: [
        {
          all: true,
          nested: true
        }
      ],
      transaction
    })

    if (user == null) {
      throw new UserInputError('User not found')
    }

    if (!user.verified) {
      throw new ForbiddenError('User is not verified')
    }

    return user.toJSON()
  }

  async getUserWithEmail(
    { email }: { email: string },
    transaction: Transaction
  ): Promise<User | null> {
    const user = await this.userModel.findOne({
      where: {
        email
      },
      transaction
    })

    return user?.toJSON() ?? null
  }

  async createUser(
    { data }: { data: SignupDto },
    transaction: Transaction
  ): Promise<User> {
    const user = await this.userModel.create(
      {
        ...data,
        picture: `https://ui-avatars.com/api/?background=4f46e5&color=fff&name=${data.name}`,
        password: await hash(data.password),
        verified: false
      },
      {
        transaction
      }
    )

    return user.toJSON()
  }

  async verifyLogin(
    { data, user }: { data: LoginDto; user: User },
    transaction: Transaction
  ) {
    if (!(await verify(user.password, data.password))) {
      throw new ForbiddenError('Incorrect password')
    }

    if (!user.verified) {
      await this.sendVerifyAccountEmail({ user }, transaction)

      throw new ForbiddenError(
        'You need to verify your account first, check your email'
      )
    }

    return user
  }

  async signToken(user: User) {
    return await this.jwt.signAsync(
      { id: user.user_id, email: user.email },
      {
        secret: this.config.getOrThrow('JWT_SECRET'),
        expiresIn: '365d'
      }
    )
  }

  async sendVerifyAccountEmail(
    { user }: { user: User },
    transaction: Transaction
  ) {
    const token = generate({
      length: 64,
      charset: 'alphabetic'
    })

    await this.verificationModel.destroy({
      where: {
        user_id: user.user_id
      },
      transaction
    })

    const verification = await this.verificationModel.create(
      {
        user_id: user.user_id,
        token: await hash(token)
      },
      {
        transaction
      }
    )

    await this.email.send({
      to: user.email,
      subject: 'Verify your Email',
      template: 'verify-email',
      metadata: {
        name: user.name,
        link: `${this.config.getOrThrow('APP_URL')}/verify-account?id=${
          verification.verification_id
        }&token=${token}`
      }
    })

    return verification.toJSON()
  }

  async updateUser(
    { id, data }: { id: number; data: Partial<User> },
    transaction: Transaction
  ) {
    await this.userModel.update(data, {
      where: {
        user_id: id
      },
      transaction
    })
  }

  async verifyAccount(
    { data }: { data: VerifyAccountDto },
    transaction: Transaction
  ) {
    const verification = await this.verificationModel.findOne({
      where: {
        verification_id: data.id,
        created_at: {
          [Op.gte]: moment().subtract(1, 'hour').toDate()
        }
      },
      transaction
    })

    if (verification == null) {
      throw new UserInputError('Invalid account verification link')
    }

    if (!(await verify(verification.token, data.token))) {
      throw new UserInputError('Invalid account verification link')
    }

    await this.updateUser(
      {
        id: verification.user_id,
        data: {
          verified: true
        }
      },
      transaction
    )

    await this.verificationModel.destroy({
      where: {
        user_id: verification.user_id
      },
      transaction
    })

    return verification.toJSON()
  }

  async sendForgotPasswordEmail(
    { user }: { user: User },
    transaction: Transaction
  ) {
    const lastRequest = await this.passwordResetModel.findOne({
      where: {
        user_id: user.user_id,
        created_at: {
          [Op.gte]: moment().subtract(3, 'minutes').toDate()
        }
      },
      transaction
    })

    if (lastRequest != null) {
      throw new UserInputError('Wait for 3 minutes before requesting again')
    }

    const token = generate({
      length: 64,
      charset: 'alphabetic'
    })

    const hashedToken = await hash(token)

    await this.passwordResetModel.destroy({
      where: {
        user_id: user.user_id
      },
      transaction
    })

    const verification = await this.passwordResetModel.create(
      {
        user_id: user.user_id,
        token: hashedToken
      },
      {
        transaction
      }
    )

    await this.email.send({
      to: user.email,
      template: 'forgot-password',
      subject: 'Password Reset Request',
      metadata: {
        name: user.name,
        link: `${this.config.getOrThrow('APP_URL')}/reset-password?id=${
          verification.password_reset_id
        }&token=${token}`
      }
    })

    return verification.toJSON()
  }

  async resetPassword(
    { data }: { data: ResetPasswordDto },
    transaction: Transaction
  ) {
    const passwordReset = await this.passwordResetModel.findOne({
      where: {
        password_reset_id: data.id,
        created_at: {
          [Op.gte]: moment().subtract(1, 'hour').toDate()
        }
      },
      transaction
    })

    if (passwordReset == null) {
      throw new UserInputError('Invalid password reset link')
    }

    if (!(await verify(passwordReset.token, data.token))) {
      throw new UserInputError('Invalid password reset link')
    }

    await this.updateUser(
      {
        id: passwordReset.user_id,
        data: {
          password: await hash(data.password)
        }
      },
      transaction
    )

    await this.passwordResetModel.destroy({
      where: {
        user_id: passwordReset.user_id
      },
      transaction
    })

    return passwordReset.toJSON()
  }
}
