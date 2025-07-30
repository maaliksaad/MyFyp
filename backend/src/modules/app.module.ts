import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { GraphQLModule } from '@nestjs/graphql'
import { JwtModule } from '@nestjs/jwt'
import { SequelizeModule } from '@nestjs/sequelize'
import { S3Store } from '@tus/s3-store'
import { type GraphQLError } from 'graphql/error'

import { ErrorFormatter } from '@/formatters'
import { ActivityModule } from '@/modules/activity/activity.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { EmailModule } from '@/modules/email/email.module'
import { FileModule } from '@/modules/file/file.module'
import { NotificationModule } from '@/modules/notification/notification.module'
import { ProjectModule } from '@/modules/project/project.module'
import { ScanModule } from '@/modules/scan/scan.module'
import { StorageModule } from '@/modules/storage/storage.module'
import { ThumbnailModule } from '@/modules/thumbnail/thumbnail.module'
import { TusModule } from '@/modules/tus/tus.module'

@Module({
  imports: [
    EventEmitterModule.forRoot({
      global: true
    }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET')
      }),
      inject: [ConfigService]
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      formatError: (error: GraphQLError) => new ErrorFormatter(error).format(),
      context: ({ req }) => ({ headers: req.headers })
    }),
    SequelizeModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        dialect: 'mysql',
        host: config.getOrThrow('SQL_HOST'),
        port: config.getOrThrow('SQL_PORT'),
        username: config.getOrThrow('SQL_USERNAME'),
        password: config.getOrThrow('SQL_PASSWORD'),
        database: config.getOrThrow('SQL_DATABASE'),
        autoLoadModels: true,
        define: {
          timestamps: true,
          createdAt: 'created_at',
          updatedAt: 'updated_at'
        },
        logging: false
      }),
      inject: [ConfigService]
    }),
    TusModule.forRootAsync({
      global: true,
      useFactory: async (config: ConfigService) => ({
        path: '/files',
        relativeLocation: true,
        datastore: new S3Store({
          s3ClientConfig: {
            bucket: config.getOrThrow('S3_BUCKET_NAME'),
            region: 'eu-north-1',
            // endpoint: config.getOrThrow('S3_ENDPOINT'),
            credentials: {
              accessKeyId: config.getOrThrow('S3_ACCESS_KEY_ID'),
              secretAccessKey: config.getOrThrow('S3_SECRET_KEY')
            }
          }
        })
      }),
      inject: [ConfigService]
    }),
    ActivityModule,
    AuthModule,
    EmailModule,
    FileModule,
    NotificationModule,
    ProjectModule,
    ScanModule,
    StorageModule,
    ThumbnailModule
  ]
})
export class AppModule {}
