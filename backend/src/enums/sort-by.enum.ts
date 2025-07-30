import { registerEnumType } from '@nestjs/graphql'

export enum SortBy {
  name = 'name',
  created_at = 'created_at'
}

registerEnumType(SortBy, { name: 'SortBy' })
