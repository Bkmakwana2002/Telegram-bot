import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { TelegramBotModule } from './telegram/telegram.module';
import { TelegramBotService } from './telegram/telegram.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [WeatherModule, TelegramBotModule,ConfigModule.forRoot({isGlobal: true})],
  providers: [TelegramBotService],
})
export class AppModule {
  constructor(private readonly telegramBotService: TelegramBotService) {
    this.telegramBotService.startBot();
  }
}
