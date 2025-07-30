import { Global, Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { Notification } from '@/models'
import { NotificationResolver } from '@/modules/notification/notification.resolver'
import { NotificationService } from '@/modules/notification/notification.service'

@Global()
@Module({
  imports: [SequelizeModule.forFeature([Notification])],
  providers: [NotificationResolver, NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}
