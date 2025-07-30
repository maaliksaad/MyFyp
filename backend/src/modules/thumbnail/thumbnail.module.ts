import { Global, Module } from '@nestjs/common'

import { ThumbnailService } from '@/modules/thumbnail/thumbnail.service'

@Global()
@Module({
  providers: [ThumbnailService],
  exports: [ThumbnailService]
})
export class ThumbnailModule {}
