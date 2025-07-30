import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { PasswordReset, User, Verification } from '@/models'
import { AuthResolver } from '@/modules/auth/auth.resolver'
import { AuthService } from '@/modules/auth/auth.service'
import { AuthStrategy } from '@/modules/auth/auth.strategy'

@Module({
  imports: [SequelizeModule.forFeature([User, Verification, PasswordReset])],
  providers: [AuthResolver, AuthService, AuthStrategy]
})
export class AuthModule {}
