import { UserInputError } from '@nestjs/apollo'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { InjectConnection } from '@nestjs/sequelize'
import { hash, verify } from 'argon2'
import { Sequelize } from 'sequelize'

import { GetUser } from '@/decorators'
import { TokenJwtGuard } from '@/guards'
import { PasswordReset, User, UserWithToken, Verification } from '@/models'
import { AuthService } from '@/modules/auth/auth.service'
import {
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  SignupDto,
  UpdateAccountDto,
  UpdatePasswordDto,
  VerifyAccountDto
} from '@/modules/auth/dtos'

@Resolver('Auth')
export class AuthResolver {
  constructor(
    private readonly auth: AuthService,
    @InjectConnection() private readonly sequelize: Sequelize
  ) {}

  @Mutation(() => Verification, { name: 'signup' })
  async signup(@Args('data') data: SignupDto) {
    return await this.sequelize.transaction(async t => {
      const prevUser = await this.auth.getUserWithEmail(
        { email: data.email },
        t
      )

      if (prevUser != null) {
        throw new UserInputError('User already exists with this email')
      }

      const user = await this.auth.createUser({ data }, t)

      return await this.auth.sendVerifyAccountEmail({ user }, t)
    })
  }

  @Mutation(() => UserWithToken, { name: 'login' })
  async login(@Args('data') data: LoginDto) {
    return await this.sequelize.transaction(async t => {
      const user = await this.auth.getUserWithEmail({ email: data.email }, t)

      if (user == null) {
        throw new UserInputError('No user found with this email')
      }

      await this.auth.verifyLogin({ data, user }, t)

      return {
        ...user,
        token: await this.auth.signToken(user)
      }
    })
  }

  @Query(() => User, { name: 'verify_token' })
  @UseGuards(TokenJwtGuard)
  async verifyToken(@GetUser() user: User) {
    return await this.sequelize.transaction(async t => {
      return await this.auth.getPopulatedUser({ user_id: user.user_id }, t)
    })
  }

  @Mutation(() => UserWithToken, { name: 'verify_account' })
  async verifyAccount(@Args('data') data: VerifyAccountDto) {
    return await this.sequelize.transaction(async t => {
      const verification = await this.auth.verifyAccount({ data }, t)

      const user = await this.auth.getPopulatedUser(
        { user_id: verification.user_id },
        t
      )

      return {
        ...user,
        token: await this.auth.signToken(user)
      }
    })
  }

  @Mutation(() => PasswordReset, { name: 'forgot_password' })
  async forgotPassword(@Args('data') data: ForgotPasswordDto) {
    return await this.sequelize.transaction(async t => {
      const user = await this.auth.getUserWithEmail({ email: data.email }, t)

      if (user == null) {
        throw new UserInputError('No user found with this email')
      }

      return await this.auth.sendForgotPasswordEmail({ user }, t)
    })
  }

  @Mutation(() => PasswordReset, { name: 'reset_password' })
  async resetPassword(@Args('data') data: ResetPasswordDto) {
    return await this.sequelize.transaction(async t => {
      return await this.auth.resetPassword({ data }, t)
    })
  }

  @Mutation(() => User, { name: 'update_account' })
  @UseGuards(TokenJwtGuard)
  async updateAccount(
    @GetUser() user: User,
    @Args('data') data: UpdateAccountDto
  ) {
    return await this.sequelize.transaction(async t => {
      await this.auth.updateUser({ id: user.user_id, data }, t)

      return await this.auth.getPopulatedUser({ user_id: user.user_id }, t)
    })
  }

  @Mutation(() => User, { name: 'update_password' })
  @UseGuards(TokenJwtGuard)
  async updatePassword(
    @GetUser() user: User,
    @Args('data') data: UpdatePasswordDto
  ) {
    return await this.sequelize.transaction(async t => {
      if (!(await verify(user.password, data.current_password))) {
        throw new UserInputError('Invalid password')
      }

      if (data.current_password === data.new_password) {
        throw new UserInputError('New password cannot be same as old password')
      }

      await this.auth.updateUser(
        {
          id: user.user_id,
          data: {
            password: await hash(data.new_password)
          }
        },
        t
      )

      return await this.auth.getPopulatedUser({ user_id: user.user_id }, t)
    })
  }
}
