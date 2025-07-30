import { Field, Int, ObjectType } from '@nestjs/graphql'
import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript'

import { File, Scan, User } from '@/models'

@ObjectType(`Project`)
@Table
export class Project extends Model {
  @Field(() => Int)
  @PrimaryKey
  @AutoIncrement
  @Column
  project_id!: number

  @Field()
  @AllowNull(false)
  @Column
  name!: string

  @Field()
  @Unique
  @AllowNull(false)
  @Column
  slug!: string

  @ForeignKey(() => File)
  @AllowNull(false)
  @Column
  thumbnail_id!: number

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  user_id!: number

  @Field(() => Date)
  @CreatedAt
  created_at!: Date

  @Field(() => File)
  @BelongsTo(() => File, {
    foreignKey: 'thumbnail_id',
    onDelete: 'CASCADE'
  })
  thumbnail: File

  @Field(() => User)
  @BelongsTo(() => User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
  })
  user: User

  @Field(() => [Scan])
  @HasMany(() => Scan, {
    foreignKey: 'project_id',
    onDelete: 'CASCADE'
  })
  scans: Scan[]
}
