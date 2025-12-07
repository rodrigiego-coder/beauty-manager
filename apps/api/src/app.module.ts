import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { GoogleCalendarModule } from './modules/google-calendar';
import { AiReceptionistModule } from './modules/ai-receptionist';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    GoogleCalendarModule,
    AiReceptionistModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
