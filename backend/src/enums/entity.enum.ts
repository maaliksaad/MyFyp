import { registerEnumType } from '@nestjs/graphql'

export enum Entity {
  scan = 'scan',
  project = 'project'
}

registerEnumType(Entity, { name: 'Entity' })
