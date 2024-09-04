import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const { timestamp, combine, printf, errors } = winston.format;

  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.File({
          dirname: './logs',
          filename: `${new Date().toISOString().split('T')[0]}.log`,
          format: combine(
            timestamp(),
            errors(),
            printf(
              (info) =>
                `${info.timestamp} ${info.level}:${
                  'context' in info && info.context ? ` [${info.context}]` : ''
                } ${info.message}`,
            ),
          ),
        }),
        new winston.transports.File({
          dirname: './logs',
          level: 'error',
          filename: `${new Date().toISOString().split('T')[0]}-error.log`,
          format: combine(
            timestamp(),
            errors({ stack: true }),
            printf(
              (info) =>
                `${info.timestamp} ${info.level}:${
                  'context' in info && info.context ? ` [${info.context}]` : ''
                } ${'stack' in info && info.stack ? info.stack : info.message}`,
            ),
          ),
        }),
      ],
    }),
  });

  app.setGlobalPrefix('bot-api');
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  await app.listen(5000);
}
bootstrap();
