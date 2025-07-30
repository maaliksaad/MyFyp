import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectAclCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class StorageService {
  constructor(
    private readonly config: ConfigService,
    @Inject('S3_CLIENT') private readonly client: S3Client
  ) {}

  async upload({ file, key }: { file: Express.Multer.File; key: string }) {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.config.getOrThrow('S3_BUCKET_NAME'),
        Key: key,
        Body: file.buffer,
        ACL: 'public-read'
      }
    })

    await upload.done()

    return {
      name: file.originalname,
      mimetype: file.mimetype,
      key,
      bucket: this.config.getOrThrow('S3_BUCKET_NAME'),
      url: `${this.config.getOrThrow('S3_SPACE_ENDPOINT')}/${key}`
    }
  }

  async get(key: string) {
    const headObjectCommand = new HeadObjectCommand({
      Bucket: this.config.getOrThrow('S3_BUCKET_NAME'),
      Key: key
    })

    const { ContentType } = await this.client.send(headObjectCommand)

    const filepath = `${this.config.getOrThrow('S3_SPACE_ENDPOINT')}/${key}`

    return {
      name: key.replace(/\//g, '-'),
      key,
      bucket: this.config.getOrThrow('S3_BUCKET_NAME'),
      url: filepath,
      mimetype: ContentType
    }
  }

  async enablePublicAccess(key: string) {
    await this.client.send(
      new PutObjectAclCommand({
        Bucket: this.config.getOrThrow('S3_BUCKET_NAME'),
        Key: key,
        ACL: 'public-read'
      })
    )
  }

  async delete(key: string) {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.config.getOrThrow('S3_BUCKET_NAME'),
          Key: key
        })
      )

      return true
    } catch {
      return false
    }
  }
}
