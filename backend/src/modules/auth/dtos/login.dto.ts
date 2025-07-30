import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

@InputType('LoginInput')
export class LoginDto {
  @Field()
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: 'email address is invalid'
    }
  )
  email: string

  @Field()
  @IsNotEmpty()
  @IsString()
  password: string
}
