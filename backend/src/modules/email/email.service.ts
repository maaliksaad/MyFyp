import { Inject, Injectable, Logger } from '@nestjs/common'
import { renderFile } from 'ejs'
import { type Transporter } from 'nodemailer'
import { join } from 'path'

@Injectable()
export class EmailService {
  constructor(
    @Inject('TRANSPORT') private readonly transporter: Transporter,
    private readonly logger: Logger
  ) {}

  async send({
    to,
    subject,
    template,
    metadata = {}
  }: {
    to: string
    template: 'verify-email' | 'forgot-password'
    subject: string
    metadata?: Record<string, any>
  }) {
    try {
      const address = '"TechBusters" <info@TechBusters.com>'

      await this.transporter.sendMail({
        from: address,
        sender: address,
        replyTo: address,
        to,
        subject: `${subject} - TechBusters`,
        html: await renderFile(
          join(__dirname, 'templates', `${template}.ejs`),
          {
            ...metadata
          }
        )
      })
    } catch {
      this.logger.error('Failed to send email')
    }
  }
}
