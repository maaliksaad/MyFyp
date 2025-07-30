import { Global, Logger, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport } from 'nodemailer'

import { EmailService } from '@/modules/email/email.service'

@Global()
@Module({
  providers: [
    EmailService,
    Logger,
    {
      provide: 'TRANSPORT',
      useFactory: (config: ConfigService) =>
        createTransport({
          host: config.getOrThrow('SMTP_HOST'),
          port: +config.getOrThrow('SMTP_PORT'),
          secure: false,
          auth: {
            user: config.getOrThrow('SMTP_USER'),
            pass: config.getOrThrow('SMTP_PASS')
          }
        }),
      inject: [ConfigService]
    }
  ],
  exports: [EmailService]
})
export class EmailModule {}
