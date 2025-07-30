import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { Scan } from '@/models'
import { ActivityModule } from '@/modules/activity/activity.module'
import { FileModule } from '@/modules/file/file.module'
import { ProjectModule } from '@/modules/project/project.module'
import { ScanResolver } from '@/modules/scan/scan.resolver'
import { ScanService } from '@/modules/scan/scan.service'

@Module({
  imports: [
    SequelizeModule.forFeature([Scan]),
    FileModule,
    ProjectModule,
    ActivityModule,
    HttpModule
  ],
  providers: [ScanResolver, ScanService]
})
export class ScanModule {}
