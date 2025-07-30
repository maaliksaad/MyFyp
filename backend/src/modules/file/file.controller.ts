import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res
} from '@nestjs/common'
import { InjectConnection } from '@nestjs/sequelize'
import { IncomingMessage, ServerResponse } from 'http'
import { Sequelize } from 'sequelize'

import { FileService } from '@/modules/file/file.service'

@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    @InjectConnection() private readonly sequelize: Sequelize
  ) {}

  @Get(':key')
  async getFile(@Param('key') key: string) {
    try {
      return await this.sequelize.transaction(async t => {
        return await this.fileService.findByKey({ key }, t)
      })
    } catch (error) {
      throw new HttpException(
        error.response ?? {
          error: error.message
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Post()
  async handleFile(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
    try {
      return await this.fileService.handle(req, res)
    } catch (error) {
      res.statusCode = error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      res.statusMessage = error.message ?? 'Internal Server Error'

      return res
    }
  }

  @Patch('/:id')
  async handleFileId(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
    try {
      return await this.fileService.handle(req, res)
    } catch (error) {
      res.statusCode = error.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      res.statusMessage =
        error.message ?? 'Unknown Error while handling file id'

      return res
    }
  }
}
