import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { Project } from '@/models'
import { ActivityModule } from '@/modules/activity/activity.module'
import { FileModule } from '@/modules/file/file.module'
import { ProjectResolver } from '@/modules/project/project.resolver'
import { ProjectService } from '@/modules/project/project.service'

@Module({
  imports: [SequelizeModule.forFeature([Project]), FileModule, ActivityModule],
  providers: [ProjectResolver, ProjectService],
  exports: [ProjectService]
})
export class ProjectModule {}
