import { Field, InputType, Int } from '@nestjs/graphql'
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator'

import { Trim } from '@/decorators'

@InputType('CreateProjectInput')
export class CreateProjectDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  @Trim()
  name: string

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  thumbnail_id: number
}
