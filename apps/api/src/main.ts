import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Registrar suporte a cookies
  await app.register(fastifyCookie, {
    secret: process.env.REFRESH_TOKEN_SECRET || 'SEGREDO_REFRESH_FORTE_AQUI',
  });

  // Configurar ValidationPipe global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Remove propriedades não declaradas no DTO
      forbidNonWhitelisted: true, // Retorna erro se enviar propriedades extras
      transform: true,           // Transforma tipos automaticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar CORS
  app.enableCors({
    origin: process.env.VITE_API_URL || 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.API_PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();