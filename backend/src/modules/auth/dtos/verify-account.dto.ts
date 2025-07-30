import { Field, InputType, Int } from '@nestjs/graphql'
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator'

@InputType('VerifyAccountInput')
export class VerifyAccountDto {
  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  id: number

  @Field()
  @IsNotEmpty()
  @IsString()
  token: string
}
