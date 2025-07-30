import { Field, Int, ObjectType } from '@nestjs/graphql'
import {
  AllowNull,
  AutoIncrement,
  Column,
  CreatedAt,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'

@ObjectType('Verification')
@Table
export class Verification extends Model {
  @Field(() => Int)
  @PrimaryKey
  @AutoIncrement
  @Column
  verification_id!: number

  @AllowNull(false)
  @Column
  token!: string

  @AllowNull(false)
  @Column
  user_id!: number

  @CreatedAt
  created_at!: Date
}
