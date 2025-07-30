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

@ObjectType('PasswordReset')
@Table
export class PasswordReset extends Model {
  @Field(() => Int)
  @PrimaryKey
  @AutoIncrement
  @Column
  password_reset_id!: number

  @AllowNull(false)
  @Column
  token!: string

  @AllowNull(false)
  @Column
  user_id!: number

  @CreatedAt
  created_at!: Date
}
