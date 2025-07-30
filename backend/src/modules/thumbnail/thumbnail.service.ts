import { Injectable } from '@nestjs/common'
import * as cuid from 'cuid'
import { existsSync, readFileSync, unlinkSync } from 'fs'
import * as thumbsupply from 'thumbsupply'
import { ThumbSize } from 'thumbsupply'

import { StorageService } from '@/modules/storage/storage.service'

@Injectable()
export class ThumbnailService {
  constructor(private readonly storage: StorageService) {}

  async generate({ url, mimetype }: { url: string; mimetype: string }) {
    if (!mimetype.includes('video')) {
      return url
    }

    const path = await thumbsupply.generateThumbnail(url, {
      size: ThumbSize.LARGE,
      timestamp: '0',
      forceCreate: true,
      cacheDir: './thumbs',
      mimetype
    })

    if (path === '') {
      return url
    }

    const name = `${cuid()}.jpg`

    const result = await this.storage.upload({
      key: `thumbnails/${name}`,
      file: {
        originalname: name,
        mimetype: 'image/jpeg',
        buffer: readFileSync(path)
      } as Express.Multer.File
    })

    if (existsSync(path)) {
      unlinkSync(path)
    }

    return result.url
  }
}
