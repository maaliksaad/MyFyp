import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString } from 'class-validator'

@InputType('UpdatePasswordInput')
export class UpdatePasswordDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  current_password: string

  @Field()
  @IsNotEmpty()
  @IsString()
  new_password: string
}
