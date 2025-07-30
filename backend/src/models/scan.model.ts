import { Field, Int, ObjectType } from '@nestjs/graphql'
import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript'

import { ScanStatus } from '@/enums'
import { File, Project, User } from '@/models'

@ObjectType('Scan')
@Table
export class Scan extends Model {
  @Field(() => Int)
  @PrimaryKey
  @AutoIncrement
  @Column
  scan_id!: number

  @Field()
  @AllowNull(false)
  @Column
  name!: string

  @Field()
  @Unique
  @AllowNull(false)
  @Column
  slug!: string

  @Field(() => ScanStatus)
  @AllowNull(false)
  @Default('Preparing')
  @Column(DataType.ENUM('Failed', 'Completed', 'Preparing'))
  status!: 'Failed' | 'Completed' | 'Preparing'

  @ForeignKey(() => File)
  @AllowNull(false)
  @Column
  input_file_id!: number

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  user_id!: number

  @ForeignKey(() => Project)
  @AllowNull(false)
  @Column
  project_id!: number

  @ForeignKey(() => File)
  @AllowNull(true)
  @Column
  splat_file_id?: number

  @Field(() => Date)
  @CreatedAt
  created_at!: Date

  @Field(() => File)
  @BelongsTo(() => File, {
    foreignKey: 'input_file_id',
    onDelete: 'CASCADE'
  })
  input_file: File

  @Field(() => User)
  @BelongsTo(() => User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE'
  })
  user: User

  @Field(() => File, { nullable: true })
  @BelongsTo(() => File, {
    foreignKey: 'splat_file_id',
    onDelete: 'CASCADE'
  })
  splat_file?: File
}
