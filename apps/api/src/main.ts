import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // Configurar CORS - permitir múltiplos domínios
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    // Domínios de produção (HTTP e HTTPS)
    'http://app.agendasalaopro.com.br',
    'https://app.agendasalaopro.com.br',
    'http://agendasalaopro.com.br',
    'https://agendasalaopro.com.br',
    'http://www.agendasalaopro.com.br',
    'https://www.agendasalaopro.com.br',
    // IP direto (fallback)
    'http://72.61.131.18',
    // Domínios antigos
    'http://beautymanager.com.br',
    'https://beautymanager.com.br',
    'http://www.beautymanager.com.br',
    'https://www.beautymanager.com.br',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sem origin (ex: curl, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Log para debug de origens não permitidas
      console.warn(`[CORS] Origem não permitida: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  });

  // Swagger - apenas em DEV
  const swaggerEnabled =
    process.env.SWAGGER_ENABLED === 'true' ||
    process.env.NODE_ENV === 'development';

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Beauty Manager API')
      .setDescription('API do sistema de gestão de salões de beleza')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // UI Swagger em /docs (também expõe /docs-json automaticamente)
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    console.log('📚 Swagger docs available at /docs');
  }

  const port = process.env.API_PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();