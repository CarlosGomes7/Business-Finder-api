import { Module } from '@nestjs/common';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { GooglePlacesService } from 'src/google-places/google-places.service';

@Module({
  controllers: [BusinessesController],
  providers: [BusinessesService, GooglePlacesService]
})
export class BusinessesModule {}
