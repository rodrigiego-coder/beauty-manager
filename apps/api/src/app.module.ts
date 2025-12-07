import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
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
import { AppointmentsModule } from './modules/appointments';
import { NotificationsModule } from './modules/notifications';
import { ConsumedProductsModule } from './modules/consumed-products';
import { AutomationsModule } from './modules/automations';
import { AuditModule } from './modules/audit';
import { ReportsModule } from './modules/reports';
import { AuditInterceptor } from './common/interceptors';
import { RolesGuard, SalonAccessGuard } from './common/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    // Módulos de segurança e compliance (ordem importa - AuditModule deve vir antes)
    AuditModule,
    ReportsModule,
    // Módulos de negócio
    GoogleCalendarModule,
    UsersModule,
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
    // Interceptor global de auditoria - registra todas as operações de escrita
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    // Guard global de permissões por role
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Guard global de acesso ao salão (multi-tenancy)
    {
      provide: APP_GUARD,
      useClass: SalonAccessGuard,
    },
  ],
})
export class AppModule {}
