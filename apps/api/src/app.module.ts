import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { DashboardModule } from './modules/dashboard';
import { CommandsModule } from './modules/commands';
import { ServicesModule } from './modules/services';
import { CashRegistersModule } from './modules/cash-registers';
import { CommissionsModule } from './modules/commissions';
import { TeamModule } from './modules/team';
import { PlansModule } from './modules/plans';
import { MercadoPagoModule } from './modules/mercado-pago';
import { AdminModule } from './modules/admin';
import { JobsModule } from './jobs';
import { CalendarModule } from './modules/calendar';
import { AutomationModule } from './modules/automation/automation.module';
import { HairProfileModule } from './modules/hair-profile/hair-profile.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { ProductSubscriptionsModule } from './modules/product-subscriptions/product-subscriptions.module';
import { UpsellModule } from './modules/upsell/upsell.module';
import { CartLinksModule } from './modules/cart-links/cart-links.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ABTestsModule } from './modules/ab-tests/ab-tests.module';
import { AIAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { AlexisModule } from './modules/alexis/alexis.module';
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
    // Rate limiting global: 100 requests por minuto por IP
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minuto
          limit: 100, // max 100 requests por minuto
        },
      ],
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
    // Modulo de dashboard
    DashboardModule,
    // Modulo de comandas
    CommandsModule,
    ServicesModule, // Modulo de servicos
    // Modulo de caixa
    CashRegistersModule,
    // Modulo de comissoes
    CommissionsModule,
    // Modulo de equipe
    TeamModule,
    // Modulo de planos (assinaturas)
    PlansModule,
    // Modulo MercadoPago
    MercadoPagoModule,
    // Modulo Admin (SUPER_ADMIN)
    AdminModule,
    // Jobs agendados
    JobsModule,
    // Integração Google Calendar (completa)
    CalendarModule,
    // Módulo de Automação WhatsApp/SMS
    AutomationModule,
    // Módulo de Inteligência de Produto
    HairProfileModule,
    RecommendationsModule,
    // Módulo de Fidelidade & Gamificação
    LoyaltyModule,
    // Módulo de Assinaturas de Produtos
    ProductSubscriptionsModule,
    // Módulo de Upsell & Vendas (FASE D)
    UpsellModule,
    CartLinksModule,
    ReservationsModule,
    ABTestsModule,
    // Módulo de IA Assistente (FASE E)
    AIAssistantModule,
    // Módulo ALEXIS - IA para WhatsApp & Dashboard (ANVISA/LGPD)
    AlexisModule,
  ],
  controllers: [AppController],
  providers: [
    // Interceptor global de auditoria
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    // Rate limiting global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
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