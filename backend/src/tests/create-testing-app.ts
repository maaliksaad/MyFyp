import { faker } from '@faker-js/faker'
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo'
import { ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { GraphQLModule } from '@nestjs/graphql'
import { JwtModule } from '@nestjs/jwt'
import { SequelizeModule } from '@nestjs/sequelize'
import { Test, type TestingModule } from '@nestjs/testing'
import type { GraphQLError } from 'graphql/error'

import { ErrorFormatter } from '@/formatters'
import { ActivityModule } from '@/modules/activity/activity.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { EmailModule } from '@/modules/email/email.module'
import { EmailService } from '@/modules/email/email.service'
import { FileModule } from '@/modules/file/file.module'
import { NotificationModule } from '@/modules/notification/notification.module'
import { ProjectModule } from '@/modules/project/project.module'
import { ScanModule } from '@/modules/scan/scan.module'
import { StorageModule } from '@/modules/storage/storage.module'
import { StorageService } from '@/modules/storage/storage.service'
import { ThumbnailModule } from '@/modules/thumbnail/thumbnail.module'
import { ThumbnailService } from '@/modules/thumbnail/thumbnail.service'
import { TUS_SERVER } from '@/modules/tus/constants'
import { TusModule } from '@/modules/tus/tus.module'

export const createTestingApp = async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      EventEmitterModule.forRoot(),
      {
        module: ConfigModule,
        global: true,
        providers: [
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockImplementation((key: string) => key),
              getOrThrow: jest.fn().mockImplementation((key: string) => key)
            }
          }
        ]
      },
      SequelizeModule.forRoot({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
        define: {
          timestamps: true,
          createdAt: 'created_at',
          updatedAt: 'updated_at'
        },
        autoLoadModels: true
      }),
      JwtModule.register({
        global: true,
        secret: 'JWT_SECRET'
      }),
      GraphQLModule.forRoot<ApolloDriverConfig>({
        driver: ApolloDriver,
        autoSchemaFile: 'schema.gql',
        formatError: (error: GraphQLError) =>
          new ErrorFormatter(error).format(),
        context: ({ req }) => ({ headers: req.headers })
      }),
      {
        module: TusModule,
        global: true,
        providers: [
          {
            provide: TUS_SERVER,
            useValue: {
              options: {},
              listen: jest.fn(),
              on: jest.fn()
            }
          }
        ],
        exports: [
          {
            provide: TUS_SERVER,
            useValue: {
              options: {},
              listen: jest.fn(),
              on: jest.fn()
            }
          }
        ]
      },
      {
        module: StorageModule,
        global: true,
        providers: [
          {
            provide: StorageService,
            useValue: {
              upload: jest.fn().mockReturnValue({
                name: faker.system.fileName(),
                key: faker.system.fileName(),
                bucket: 'voxtesy-data',
                url: faker.internet.url(),
                mimetype: faker.system.mimeType()
              }),
              delete: jest.fn().mockResolvedValue(true)
            }
          }
        ]
      },
      {
        module: EmailModule,
        global: true,
        providers: [
          {
            provide: EmailService,
            useValue: {
              send: jest.fn()
            }
          }
        ]
      },
      {
        module: ThumbnailModule,
        global: true,
        providers: [
          {
            provide: ThumbnailService,
            useValue: {
              generate: jest.fn().mockResolvedValue(faker.internet.url())
            }
          }
        ]
      },
      ActivityModule,
      AuthModule,
      FileModule,
      NotificationModule,
      ProjectModule,
      ScanModule
    ]
  }).compile()

  const app = module.createNestApplication()

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true
    })
  )

  app.useLogger({
    log: jest.fn,
    error: jest.fn,
    warn: jest.fn
  })

  return app
}
