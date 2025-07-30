import { Field, Int, ObjectType } from '@nestjs/graphql'
import {
  AllowNull,
  AutoIncrement,
  Column,
  CreatedAt,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript'

@ObjectType({ description: 'User' })
@Table
export class User extends Model {
  @Field(() => Int)
  @PrimaryKey
  @AutoIncrement
  @Column
  user_id!: number

  @Field()
  @AllowNull(false)
  @Column
  name!: string

  @Field()
  @Unique
  @AllowNull(false)
  @Column
  email!: string

  @AllowNull(false)
  @Column
  password!: string

  @Field()
  @AllowNull(false)
  @Column
  picture!: string

  @Field()
  @AllowNull(false)
  @Column
  verified!: boolean

  @Field(() => Date)
  @CreatedAt
  created_at!: Date
}

@ObjectType({ description: 'UserWithToken' })
export class UserWithToken extends User {
  @Field()
  token: string
}
