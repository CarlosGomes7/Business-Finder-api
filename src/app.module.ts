import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BusinessesModule } from './businesses/businesses.module';
import { GooglePlacesService } from './google-places/google-places.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiLeadsModule } from './ai-leads/ai-leads.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
     MulterModule.register({
      // Opcional: configuración personalizada
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minuto
      limit: 10, // 10 requests por minuto
    }]),
    BusinessesModule,
    AiLeadsModule],
  controllers: [AppController],
  providers: [AppService, GooglePlacesService],
})
export class AppModule {}
