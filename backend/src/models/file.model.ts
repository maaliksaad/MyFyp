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

@ObjectType({ description: 'File' })
@Table
export class File extends Model {
  @Field(() => Int)
  @PrimaryKey
  @AutoIncrement
  @Column
  file_id!: number

  @Field()
  @AllowNull(false)
  @Column
  name!: string

  @Field()
  @AllowNull(false)
  @Column
  key!: string

  @Field()
  @AllowNull(false)
  @Column
  bucket!: string

  @Field()
  @AllowNull(false)
  @Column
  url!: string

  @Field()
  @AllowNull(false)
  @Column
  type!: 'Video' | 'Image'

  @Field()
  @AllowNull(false)
  @Column
  mimetype: string

  @Field()
  @AllowNull(false)
  @Column
  thumbnail: string

  @Field(() => Date)
  @CreatedAt
  created_at!: Date
}
