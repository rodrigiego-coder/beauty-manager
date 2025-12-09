import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { GoogleCalendarModule } from './modules/google-calendar';
import { AiReceptionistModule } from './modules/ai-receptionist';
import { ProductsModule } from './modules/products';
import { TransactionsModule } from './modules/transactions';
import { AccountsPayableModule } from './modules/accounts-payable';
import { AccountsReceivableModule } from './modules/accounts-receivable';
import { UsersModule } from './modules/users';
import { SalonsModule } from './modules/salons';
import { AppointmentsModule } from './modules/appointments';
import { NotificationsModule } from './modules/notifications';
import { ConsumedProductsModule } from './modules/consumed-products';
import { AutomationsModule } from './modules/automations';
import { AuditModule } from './modules/audit';
import { ReportsModule } from './modules/reports';
import { AuditInterceptor } from './common/interceptors';
import { AuthGuard, RolesGuard, SalonAccessGuard } from './common/guards';
import { AuthModule } from './modules/auth';
import { SubscriptionsModule } from './modules/subscriptions';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET || 'SEGREDO_ACESSO_FORTE_AQUI',
      signOptions: { expiresIn: '30m' },
    }),
    DatabaseModule,
    // Modulos de seguranca e compliance
    AuditModule,
    ReportsModule,
    // Modulo de autenticacao
    AuthModule,
    // Modulo de assinaturas
    SubscriptionsModule,
    // Modulos de negocio
    GoogleCalendarModule,
    UsersModule,
    SalonsModule,
    AppointmentsModule,
    AiReceptionistModule,
    ProductsModule,
    TransactionsModule,
    AccountsPayableModule,
    AccountsReceivableModule,
    NotificationsModule,
    ConsumedProductsModule,
    AutomationsModule,
  ],
  controllers: [AppController],
  providers: [
    // Interceptor global de auditoria
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    // Guard global de autenticacao
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // Guard global de permissoes por role
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Guard global de acesso ao salao (multi-tenancy)
    {
      provide: APP_GUARD,
      useClass: SalonAccessGuard,
    },
  ],
})
export class AppModule {}