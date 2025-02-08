export interface WeatherData {
  coord: {
    lat: number;
    lon: number;
    alt?: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
    sea_level?: number;
    grnd_level?: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
    country: string;
  };
  name: string;
  dt: number;
  timezone: number;
  population?: number;
}

export interface ForecastData {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  dt_txt: string;
}

export interface DailyForecast {
  dt: number;
  temp: {
    min: number;
    max: number;
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  speed: number;
  pop?: number;
}