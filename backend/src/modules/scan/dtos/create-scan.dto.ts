import { Field, InputType, Int } from '@nestjs/graphql'
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator'

import { Trim } from '@/decorators'

@InputType('CreateScanInput')
export class CreateScanDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  @Trim()
  name: string

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  input_file_id: number

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  project_id: number
}
