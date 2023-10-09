import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const { timestamp, combine, printf, errors } = winston.format;

  await NestFactory.createApplicationContext(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.File({
          dirname: './logs',
          filename: `${new Date().toISOString().split('T')[0]}.log`,
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
}
bootstrap();
