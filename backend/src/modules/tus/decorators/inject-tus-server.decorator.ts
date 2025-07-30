import { Inject } from '@nestjs/common'

import { TUS_SERVER } from '@/modules/tus/constants'

export function InjectTusServer() {
  return Inject(TUS_SERVER)
}
