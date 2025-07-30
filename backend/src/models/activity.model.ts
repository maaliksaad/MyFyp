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

import { Entity } from '@/enums'
import { User } from '@/models'

@ObjectType({ description: 'Activity' })
@Table
export class Activity extends Model {
  @Field(() => Int)
  @PrimaryKey
  @AutoIncrement
  @Column
  activity_id!: number

  @Field(() => Entity)
  @AllowNull(false)
  @Column(DataType.ENUM('project', 'scan'))
  entity!: 'project' | 'scan'

  @Field()
  @AllowNull(false)
  @Column
  type!: string

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
