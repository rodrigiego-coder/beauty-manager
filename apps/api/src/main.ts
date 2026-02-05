import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, LogLevel } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module';

async function bootstrap() {
  // Configura níveis de log baseado no ambiente
  // Produção: apenas 'error', 'warn', 'log'
  // Desenvolvimento: inclui 'debug' e 'verbose'
  const isProduction = process.env.NODE_ENV === 'production';
  const logLevels: LogLevel[] = isProduction
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'debug', 'verbose'];

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: logLevels },
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
    // Z-API (WhatsApp integration webhooks)
    'https://api.z-api.io',
    'http://api.z-api.io',
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

  // Swagger - habilitado apenas quando ENABLE_SWAGGER=true e credenciais definidas
  const swaggerEnabled = process.env.ENABLE_SWAGGER === 'true';
  const swaggerUser = process.env.SWAGGER_USER;
  const swaggerPass = process.env.SWAGGER_PASS;

  if (swaggerEnabled) {
    if (!swaggerUser || !swaggerPass) {
      console.warn(
        '⚠️  [Swagger] ENABLE_SWAGGER=true mas SWAGGER_USER ou SWAGGER_PASS não definidos. Swagger NÃO será montado.',
      );
    } else {
      const fastifyInstance = app.getHttpAdapter().getInstance();

      // Basic Auth middleware para proteger /docs e /docs-json
      fastifyInstance.addHook('onRequest', async (request, reply) => {
        const url = request.url;
        if (!url.startsWith('/docs')) {
          return;
        }

        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Basic ')) {
          reply
            .code(401)
            .header('WWW-Authenticate', 'Basic realm="Swagger Docs"')
            .send({ statusCode: 401, message: 'Unauthorized' });
          return;
        }

        const base64Credentials = authHeader.slice(6);
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
        const [user, pass] = credentials.split(':');

        if (user !== swaggerUser || pass !== swaggerPass) {
          reply
            .code(401)
            .header('WWW-Authenticate', 'Basic realm="Swagger Docs"')
            .send({ statusCode: 401, message: 'Unauthorized' });
          return;
        }
      });

      // Swagger com documentFactory lazy - documento criado sob demanda
      SwaggerModule.setup('docs', app, () => {
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

        return SwaggerModule.createDocument(app, config);
      }, {
        swaggerOptions: {
          persistAuthorization: true,
        },
      });

      console.log('📚 Swagger docs available at /docs (protected by Basic Auth)');
    }
  }

  const port = process.env.API_PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();