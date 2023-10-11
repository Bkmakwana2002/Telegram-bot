// Import necessary modules and dependencies
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { API } from '../models/apiKeys.model';

@Injectable()
export class WeatherService {
    async getWeather(lat: string, long: string) {
        // Fetch API keys from the database
        const apiKeys = await API.find();
        
        // Check if API keys are available
        if (!apiKeys) {
            throw new Error('API keys not found in the database');
        }

        // Extract the API key and host from the retrieved data
        const key = apiKeys[0].RapidAPI_Key;
        const host = apiKeys[0].RapidAPI_Host;

        // Log the API key and host for debugging
        console.log('API Key:', key);
        console.log('API Host:', host);

        // Prepare the HTTP request configuration
        const options = {
            method: 'GET',
            url: 'https://weatherapi-com.p.rapidapi.com/current.json',
            params: { q: `${lat},${long}` },
            headers: {
                'X-RapidAPI-Key': key,
                'X-RapidAPI-Host': host,
            }
        };

        try {
            // Send an HTTP request to retrieve weather data
            const response = await axios.request(options);
            
            // Return the weather data if the request is successful
            return response.data;
        } catch (error) {
            // Handle and log any errors that occur during the request
            console.error(error);
        }
    }
}
