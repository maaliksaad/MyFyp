import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import * as ejs from 'ejs'
import type * as nodemailer from 'nodemailer'

import { EmailService } from '@/modules/email/email.service'

jest.spyOn(ejs, 'renderFile').mockResolvedValue('')

describe('EmailService', () => {
  let emailService: EmailService
  let transporter: nodemailer.Transporter
  let logger: Logger

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('key'),
            getOrThrow: jest.fn().mockReturnValue('key')
          }
        },
        {
          provide: Logger,
          useValue: {
            error: jest.fn()
          }
        },
        {
          provide: 'TRANSPORT',
          useValue: {
            sendMail: jest.fn()
          }
        }
      ]
    }).compile()

    emailService = module.get<EmailService>(EmailService)
    logger = module.get<Logger>(Logger)
    transporter = module.get<nodemailer.Transporter>('TRANSPORT')
  })

  it('should be defined', () => {
    expect(emailService).toBeDefined()
    expect(logger).toBeDefined()
    expect(transporter).toBeDefined()
  })

  describe('send', () => {
    it('given valid data: should send the email', async () => {
      jest.spyOn(transporter, 'sendMail').mockResolvedValue({})

      const data = {
        to: faker.internet.email(),
        subject: faker.lorem.sentence(),
        template: 'verify-email' as 'verify-email',
        metadata: {
          link: faker.internet.url()
        }
      }

      await emailService.send(data)

      expect(transporter.sendMail).toHaveBeenCalled()
    })

    it('given an error: should log the error', async () => {
      jest.spyOn(transporter, 'sendMail').mockRejectedValue(new Error('Failed'))

      const data = {
        to: faker.internet.email(),
        subject: faker.lorem.sentence(),
        template: 'verify-email' as 'verify-email'
      }

      await emailService.send(data)

      expect(logger.error).toBeCalled()
    })
  })
})
