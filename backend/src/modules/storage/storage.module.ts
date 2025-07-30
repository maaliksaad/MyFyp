import { S3Client } from '@aws-sdk/client-s3'
import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { StorageService } from '@/modules/storage/storage.service'

@Global()
@Module({
  providers: [
    StorageService,
    {
      provide: 'S3_CLIENT',
      useFactory: (config: ConfigService) =>
        new S3Client({
          forcePathStyle: false,
          region: 'eu-north-1',
          credentials: {
            accessKeyId: config.getOrThrow('S3_ACCESS_KEY_ID'),
            secretAccessKey: config.getOrThrow('S3_SECRET_KEY')
          }
        }),
      inject: [ConfigService]
    }
  ],
  exports: [StorageService]
})
export class StorageModule {}
