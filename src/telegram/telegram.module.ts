import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram.service';
import { WeatherModule } from 'src/weather/weather.module';

@Module({
  imports: [WeatherModule],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class TelegramBotModule {}