import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

@InputType('SignupInput')
export class SignupDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string

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
