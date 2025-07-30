import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from '@/modules/app.module'

const PORT = process.env.PORT ?? 8080

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true
    })
  )

  app.enableCors({
    origin: true
  })

  await app.listen(PORT)
}

bootstrap()
  .then(() => {
    console.log(`Application is running on: http://localhost:${PORT}`)
  })
  .catch(error => {
    console.error(error)
  })
