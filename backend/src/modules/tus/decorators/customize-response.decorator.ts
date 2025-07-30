import { applyDecorators, SetMetadata } from '@nestjs/common'

import { EVENT_NAME, TUS_EVENTS } from '@/modules/tus/constants'

export function CustomizeResponse() {
  return applyDecorators(SetMetadata(EVENT_NAME, TUS_EVENTS.CUSTOMIZE_RESPONSE))
}
