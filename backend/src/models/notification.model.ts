import { Field, Int, ObjectType } from '@nestjs/graphql'
import { GraphQLJSONObject } from 'graphql-type-json'
import {
  AllowNull,
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'

import { User } from '@/models/index'

@ObjectType({ description: 'Notification' })
@Table
export class Notification extends Model {
  @Field(() => Int)
  @PrimaryKey
  @AutoIncrement
  @Column
  notification_id!: number

  @Field()
  @AllowNull(false)
  @Column
  title!: string

  @Field()
  @AllowNull(false)
  @Column
  type!: string

  @Field()
  @AllowNull(false)
  @Column
  read!: boolean

  @Field(() => GraphQLJSONObject)
  @AllowNull(false)
  @Column(DataType.JSON)
  metadata!: Record<string, any>

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  user_id!: number

  @Field(() => Date)
  @CreatedAt
  created_at!: Date
}
