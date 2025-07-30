import { UseGuards } from '@nestjs/common'
import { Mutation, Query, Resolver } from '@nestjs/graphql'
import { InjectConnection } from '@nestjs/sequelize'
import { Sequelize } from 'sequelize'

import { GetUser } from '@/decorators'
import { TokenJwtGuard } from '@/guards'
import { Notification, User } from '@/models'
import { NotificationService } from '@/modules/notification/notification.service'

@Resolver()
export class NotificationResolver {
  constructor(
    private readonly notificationService: NotificationService,
    @InjectConnection() private readonly sequelize: Sequelize
  ) {}

  @Query(() => [Notification], { name: 'notifications' })
  @UseGuards(TokenJwtGuard)
  async getNotifications(@GetUser() user: User) {
    return await this.sequelize.transaction(async t => {
      return await this.notificationService.findAll(
        { user_id: user.user_id },
        t
      )
    })
  }

  @Mutation(() => [Notification], { name: 'read_notifications' })
  @UseGuards(TokenJwtGuard)
  async readNotifications(@GetUser() user: User) {
    return await this.sequelize.transaction(async t => {
      return await this.notificationService.read({ user_id: user.user_id }, t)
    })
  }
}
