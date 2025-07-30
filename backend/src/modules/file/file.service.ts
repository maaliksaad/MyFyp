import { UserInputError } from '@nestjs/apollo'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/sequelize'
import { Server, type Upload } from '@tus/server'
import * as cuid from 'cuid'
import { type IncomingMessage, type ServerResponse } from 'http'
import { Sequelize, type Transaction } from 'sequelize'

import { File } from '@/models'
import { StorageService } from '@/modules/storage/storage.service'
import { ThumbnailService } from '@/modules/thumbnail/thumbnail.service'
import {
  CustomizeResponse,
  InjectTusServer,
  NamingFunction
} from '@/modules/tus/decorators'

@Injectable()
export class FileService {
  constructor(
    private readonly storage: StorageService,
    private readonly thumbnail: ThumbnailService,
    @InjectTusServer() private readonly server: Server,
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(File) private readonly fileModel: typeof File
  ) {}

  async findById(
    { file_id }: { file_id: number },
    transaction: Transaction
  ): Promise<File> {
    const file = await this.fileModel.findOne({
      where: {
        file_id
      },
      transaction
    })

    if (file == null) {
      throw new UserInputError('File not found')
    }

    return file.toJSON()
  }

  async findByKey({ key }: { key: string }, transaction: Transaction) {
    const file = await this.fileModel.findOne({
      where: {
        key
      },
      transaction
    })

    if (file == null) {
      throw new NotFoundException({
        error: 'File not found'
      })
    }

    return file.toJSON()
  }

  async delete({ file }: { file: File }, transaction: Transaction) {
    await this.storage.delete(file.key)
    await this.fileModel.destroy({
      where: {
        file_id: file.file_id
      },
      transaction
    })
  }

  async handle(req: IncomingMessage, res: ServerResponse) {
    return await this.server.handle(req, res)
  }

  @CustomizeResponse()
  async onUploadFinish(
    req: IncomingMessage,
    res: ServerResponse,
    upload: Upload
  ) {
    if (upload.metadata?.filetype == null) {
      res.statusCode = 400
      res.statusMessage = 'Invalid Filetype'

      return res
    }

    const mimetype = req.headers['file-type'] as string

    let type = 'Video'

    if (mimetype.includes('video')) {
      type = 'Video'
    } else if (mimetype.includes('image')) {
      type = 'Image'
    } else {
      await this.storage.delete(upload.id)

      res.statusCode = 400
      res.statusMessage = 'Invalid Filetype'

      return res
    }

    if (upload.id.split('/').shift() === '') {
      await this.storage.delete(upload.id)

      res.statusCode = 400
      res.statusMessage = 'Invalid Filetype'

      return res
    }

    const data = await this.storage.get(upload.id)

    await this.storage.enablePublicAccess(upload.id)

    const thumbnail = await this.thumbnail.generate({
      url: data.url,
      mimetype
    })

    await this.sequelize.transaction(async t => {
      await this.fileModel.create(
        {
          ...data,
          type,
          mimetype,
          thumbnail
        },
        { transaction: t }
      )
    })

    return res
  }

  @NamingFunction()
  async namingFunction(req: IncomingMessage) {
    const filename = (req.headers['file-name'] as string) ?? ''

    return `${cuid()}.${filename.split('.').pop()}`
  }
}
