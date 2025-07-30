import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty } from 'class-validator'

@InputType('ForgotPasswordInput')
export class ForgotPasswordDto {
  @Field()
  @IsNotEmpty()
  @IsEmail({}, { message: 'email address is invalid' })
  email: string
}
