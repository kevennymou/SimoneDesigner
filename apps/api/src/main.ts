import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Sanitiza pra qualquer caractere não-ASCII-imprimível (aspas curvas, espaço não-quebrável,
  // zero-width etc. vindos de copiar/colar em painéis de hospedagem) não derrubar o header CORS.
  const rawCorsOrigin = process.env.CORS_ORIGIN ?? '';
  // eslint-disable-next-line no-control-regex
  const corsOrigin = rawCorsOrigin.replace(/[^\x20-\x7E]/g, '').trim() || 'http://localhost:3000';
  console.log(`CORS_ORIGIN em uso: "${corsOrigin}"`);
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
