import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { Activity, Project, Scan } from '@/models'
import { ActivityResolver } from '@/modules/activity/activity.resolver'
import { ActivityService } from '@/modules/activity/activity.service'

@Module({
  imports: [SequelizeModule.forFeature([Activity, Scan, Project])],
  providers: [ActivityResolver, ActivityService],
  exports: [ActivityService]
})
export class ActivityModule {}
