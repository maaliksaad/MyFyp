import { registerEnumType } from '@nestjs/graphql'

export enum Sort {
  ascending = 'ascending',
  descending = 'descending'
}

registerEnumType(Sort, { name: 'Sort' })
