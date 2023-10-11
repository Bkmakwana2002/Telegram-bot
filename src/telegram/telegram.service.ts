import { Injectable, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { WeatherService } from '../weather/weather.service';
var cron = require('node-cron');
const connectDatabase = require('../db/database.config');
import { Subscription } from '../models/subscription.model';
import { API } from '../models/apiKeys.model';

@Injectable()
export class TelegramBotService {
    private readonly bot: Telegraf;
    private readonly subscriptions = new Map<number, string>();

    constructor(private readonly weatherService: WeatherService) {
        // Initialize the Telegram bot
        this.bot = new Telegraf(process.env.TELEGRAM_BOT_KEY);

        // Set up bot commands and schedules
        this.setupCommands();
        this.scheduleWeatherUpdates();

        // Connect to the database
        connectDatabase();
    }

    // Set up bot commands
    private setupCommands(): void {
        // Handling the /start command
        this.bot.start((ctx) =>
            ctx.reply(
                'Welcome to Weather Bot! To subscribe for daily weather updates, use /subscribe <city>.*For more commands use `/update` command'
            )
        );

        // Handling the /help command
        this.bot.command('help', (ctx) => this.sendHelpMessage(ctx));
        // Handling the /subscribe command
        this.bot.command('subscribe', (ctx) => this.subscribeUser(ctx));
        // Handling the /unsubscribe command
        this.bot.command('unsubscribe', (ctx) => this.unsubscribeUser(ctx));
        // Handling the /update command
        this.bot.command('update', (ctx) => this.subscribeUser(ctx));
    }

    // Sending a help message with Markdown formatting
    private sendHelpMessage(ctx): void {
        const helpText = `
    *Available commands*:
    
    - \`/subscribe <city>\` - Subscribe to daily weather updates for a city (You can use latitude and longitude like \`<lat,long>\` instead of \`<city>\` for accurate results).
    - \`/unsubscribe\` - Unsubscribe from daily weather updates.
    - \`/update\` - Update your subscribed city.
    - \`/help\` - Show this help message.
    
    *Example*:
    - To subscribe: \`/subscribe New York\`
    - To update: \`/update Paris\`
    `;

        ctx.replyWithMarkdown(helpText);
    }

    // Subscribing a user to daily weather updates
    private async subscribeUser(ctx): Promise<void> {
        const userId = ctx.message.from.id;
        const city = ctx.message.text.split(' ').slice(1).join(' ');

        try {
            // Check if the user is already in the database
            const user = await Subscription.findOne({ userId: userId });
            if (user === null) {
                // If not, create a new subscription record
                const data = await Subscription.create({
                    userId,
                    city
                });

                this.subscriptions.set(userId, city);
                console.log(this.subscriptions);
                console.log(data);
                ctx.reply(`You are now subscribed to daily weather updates for ${city}.`);
                Logger.log(`User ${userId} subscribed to ${city}`);
            } else {
                // If the user is in the database, update their subscription
                await Subscription.findOneAndUpdate({ userId: userId }, { city: city });
                this.subscriptions.set(userId, city);
                console.log(this.subscriptions);
                ctx.reply(`You are now subscribed to daily weather updates for ${city}.`);
                Logger.log(`User ${userId} subscribed to ${city}`);
            }
        } catch (error) {
            console.error('Error saving subscription to the database:', error);
            ctx.reply('Failed to subscribe. Please try again later.');
        }
    }

    // Unsubscribing a user from daily weather updates
    private async unsubscribeUser(ctx): Promise<void> {
        const userId = ctx.message.from.id;
        try {
            const subscription = await Subscription.findOne({ userId: userId });

            if (subscription) {
                const city = subscription.city;

                await Subscription.findOneAndRemove({ userId: userId });

                this.subscriptions.delete(userId);

                ctx.reply(`You are unsubscribed from daily weather updates for ${city}.`);
                Logger.log(`User unsubscribed from ${city}`);
            } else {
                ctx.reply(`You are not subscribed to any city's weather updates.`);
            }
        } catch (error) {
            console.error('Error unsubscribing a user from the database:', error);
            ctx.reply('Failed to unsubscribe. Please try again later.');
        }
    }

    // Starting the Telegram bot
    async startBot(): Promise<void> {
        await this.bot.launch();
        Logger.log('Telegram bot started.');
    }

    // Sending daily weather updates to subscribed users
    private async sendDailyWeatherUpdates(): Promise<void> {
        try {
            const subscriptions = await Subscription.find();

            for (const subscription of subscriptions) {
                const userId = subscription.userId;
                const city = subscription.city;

                try {
                    const splitArray = city.split(',');
                    const weatherData = await this.weatherService.getWeather(splitArray[0], splitArray[1]);
                    console.log(weatherData);
                    const weatherText = `Weather in ${city}:\nTemperature: ${weatherData.current.temp_c}° \n Humidity : ${weatherData.current.humidity} \n Gust : ${weatherData.current.gust_kph} kph \n Wind Speed : ${weatherData.current.wind_kph} kph`;
                    this.bot.telegram.sendMessage(userId, weatherText);
                    await Subscription.findOneAndUpdate({ userId: userId }, { $inc: { apiCallCount: 1 } });
                    Logger.log(`Sent daily weather updates to user ${userId}`);
                } catch (error) {
                    Logger.error(`Failed to fetch weather data for ${city}`);
                }
            }
        } catch (error) {
            console.error('Error fetching subscriptions from the database:', error);
        }
    }

    // Scheduling daily weather updates
    private async scheduleWeatherUpdates(): Promise<void> {
        const apiKeys = await API.find();
        const time = apiKeys[0].time;
        cron.schedule(time, () => {
            this.sendDailyWeatherUpdates();
        });
        Logger.log('Scheduled daily weather updates.');
    }
}
