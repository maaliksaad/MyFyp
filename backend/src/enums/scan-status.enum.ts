import { registerEnumType } from '@nestjs/graphql'

export enum ScanStatus {
  Failed = 'Failed',
  Completed = 'Completed',
  Preparing = 'Preparing'
}

registerEnumType(ScanStatus, { name: 'ScanStatus' })
