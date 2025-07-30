import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { File } from '@/models'
import { FileController } from '@/modules/file/file.controller'
import { FileService } from '@/modules/file/file.service'

@Module({
  imports: [SequelizeModule.forFeature([File])],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService]
})
export class FileModule {}
