import { Field, InputType } from '@nestjs/graphql'
import { IsOptional, IsString } from 'class-validator'

@InputType('UpdateScanInput')
export class UpdateScanDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string
}
