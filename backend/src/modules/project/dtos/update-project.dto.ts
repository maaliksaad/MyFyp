import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString } from 'class-validator'

@InputType('UpdateProjectInput')
export class UpdateProjectDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string
}
