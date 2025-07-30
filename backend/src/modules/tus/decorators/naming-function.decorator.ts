import { applyDecorators, SetMetadata } from '@nestjs/common'

import { EVENT_NAME, TUS_EVENTS } from '@/modules/tus/constants'

export function NamingFunction() {
  return applyDecorators(SetMetadata(EVENT_NAME, TUS_EVENTS.NAMING_FUNCTION))
}
