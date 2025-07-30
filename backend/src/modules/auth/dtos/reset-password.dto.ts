import { Field, InputType, Int } from '@nestjs/graphql'
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator'

@InputType('ResetPasswordInput')
export class ResetPasswordDto {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  id: number

  @Field()
  @IsNotEmpty()
  @IsString()
  token: string

  @Field()
  @IsNotEmpty()
  @IsString()
  password: string
}
