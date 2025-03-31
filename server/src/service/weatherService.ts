import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  lat: number;
  long: number;
}

class Weather {
  city: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
  weatherIcon: string;
  date: string; // Add the date field

  constructor(
    city: string,
    temperature: number,
    windSpeed: number,
    humidity: number,
    uvIndex: number,
    weatherIcon: string,
    date: string // Add the date parameter
  ) {
    this.city = city;
    this.temperature = temperature;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.uvIndex = uvIndex;
    this.weatherIcon = weatherIcon;
    this.date = date; // Assign the date
  }
}

class WeatherService {
  baseURL: string;
  apiKey: string;
  city: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.city = '';
    console.log(`API Base URL: ${this.baseURL}`);
    console.log(`API Key: ${this.apiKey}`);
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    console.log(`Build Weather Query says: ${this.baseURL}/forecast?lat=${coordinates.lat}&lon=${coordinates.long}&units=imperial&appid=${this.apiKey}`);
    return `${this.baseURL}/forecast?lat=${coordinates.lat}&lon=${coordinates.long}&units=imperial&appid=${this.apiKey}`;
  }

  private async fetchAndDestructureLocationData(query: string) {
    try {
      const url = `${this.baseURL}/forecast?q=${query}&appid=${this.apiKey}`;
      console.log('Fetching location data from URL:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not OK. Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Location data:', data);

      if (!data.city || !data.city.coord) {
        throw new Error('Invalid response format: Missing city coordinates');
      }

      const { city: { coord: { lat, lon } } } = data;
      return { lat, long: lon };
    } catch (err) {
      console.error('ERROR: There was a problem with the fetchAndDestructureLocationData method:', err);
      throw err;
    }
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const response = await fetch(this.buildWeatherQuery(coordinates));
  if (!response.ok) {
    throw new Error(`FETCH WEATHER DATA: Network response was not OK.`);
  }
  const data = await response.json();
  console.log('Weather data:', JSON.stringify(data, null, 2)); // Log the full response
  return data;
  }

  private parseCurrentWeather(response: any): Weather {
    if (!response || !response.list || !response.list[0] || !response.city) {
      throw new Error('Invalid response format');
    }
  
    const currentWeatherData = response.list[0];
    const cityName = response.city.name;
  
    // Validate and log the fields
    console.log('Current weather data:', currentWeatherData);
  
    const temperature = currentWeatherData.main?.temp ?? 0; // Fallback to 0 if temp is missing
    const windSpeed = currentWeatherData.wind?.speed ?? 0; // Fallback to 0 if wind speed is missing
    const humidity = currentWeatherData.main?.humidity ?? 0; // Fallback to 0 if humidity is missing
    const weatherIcon = currentWeatherData.weather?.[0]?.icon ?? ''; // Fallback to empty string if icon is missing
    const date = currentWeatherData.dt_txt ?? 'Unknown Date'; // Fallback to 'Unknown Date' if dt_txt is missing
  
    return new Weather(
      cityName,
      temperature,
      windSpeed,
      humidity,
      0, // UV Index (not provided in the current response, set to 0 or fetch separately)
      weatherIcon,
      date
    );
  }

  private buildForecastArray(weatherData: any[]): Weather[] {
    console.log(`Data being placed in the buildForecastArray for ${this.city}`);
    const filteredData = weatherData.filter(data => data.dt_txt.endsWith("00:00:00"));
    const limitedData = filteredData.slice(0, 5);
  
    return limitedData.map(data => {
      console.log('Forecast data:', data); // Log each forecast entry
      const temperature = data.main?.temp ?? 0; // Fallback to 0 if temp is missing
      const windSpeed = data.wind?.speed ?? 0; // Fallback to 0 if wind speed is missing
      const humidity = data.main?.humidity ?? 0; // Fallback to 0 if humidity is missing
      const weatherIcon = data.weather?.[0]?.icon ?? ''; // Fallback to empty string if icon is missing
      const date = data.dt_txt ?? 'Unknown Date'; // Fallback to 'Unknown Date' if dt_txt is missing
  
      return new Weather(
        this.city,
        temperature,
        windSpeed,
        humidity,
        0, // UV Index (not provided in the forecast data, set to 0 or fetch separately)
        weatherIcon,
        date
      );
    });
}

  async getWeatherForCity(city: string): Promise<Weather[]> {
    console.log("Call has arrived. Starting fetchAndDestructureLocationData");
    this.city = city; // Set the city name here
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    console.log("Weather data fetched, moving to parsing current weather...");
    const currentWeather = this.parseCurrentWeather(weatherData);
    console.log("Current Weather Parsed.");
    const forecastArray = this.buildForecastArray(weatherData.list);
    console.log("Forecast Array Built.");
    const result = [currentWeather, ...forecastArray];
    console.log("Final data being sent to the frontend:", result); // Log the final data
    return result;
  }
}

export default new WeatherService();