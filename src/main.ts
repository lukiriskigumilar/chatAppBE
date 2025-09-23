import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //delete property that is not in dto
      forbidNonWhitelisted: true, //throw error if property that is not in dto
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on:  http://localhost:${process.env.PORT ?? 3000}`,
  );
}
bootstrap();
