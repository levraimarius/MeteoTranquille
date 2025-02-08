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

export interface CityData {
  nom: string;
  code: string;
  codeDepartement: string;
  departement: {
    nom: string;
  };
  region: {
    nom: string;
  };
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

export interface DailyForecast extends ForecastData {
  dt: number;
  temp: {
    min: number;
    max: number;
    day: number;
    night?: number;
    eve?: number;
    morn?: number;
  };
  speed: number;
  pop?: number;
}

export interface ForecastApiResponse {
  list: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      pressure: number;
      humidity: number;
      temp_min: number;
      temp_max: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
    wind: {
      speed: number;
      deg: number;
      gust?: number;
    };
    pop: number;
    dt_txt: string;
  }[];
}
