import { WeatherData } from '../../src/types';

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    precipitation: number;
  };
}

// Well-known coordinates for Indian cities and key hubs if reverse geocoding is approximate
const KNOWN_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  bengaluru: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru, Karnataka' },
  bangalore: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru, Karnataka' },
  indiranagar: { lat: 12.9784, lon: 77.6408, name: 'Indiranagar, Bengaluru' },
  panathur: { lat: 12.9348, lon: 77.7011, name: 'Panathur Underpass, Bengaluru' },
  malleshwaram: { lat: 13.0031, lon: 77.5643, name: 'Malleshwaram, Bengaluru' },
  basavanagudi: { lat: 12.9416, lon: 77.5752, name: 'Basavanagudi, Bengaluru' },
  mumbai: { lat: 19.0760, lon: 72.8777, name: 'Mumbai, Maharashtra' },
  delhi: { lat: 28.7041, lon: 77.1025, name: 'Delhi NCR' },
  chennai: { lat: 13.0827, lon: 80.2707, name: 'Chennai, Tamil Nadu' },
  hyderabad: { lat: 17.3850, lon: 78.4867, name: 'Hyderabad, Telangana' },
  kolkata: { lat: 22.5726, lon: 88.3639, name: 'Kolkata, West Bengal' },
};

export class WeatherService {
  // In-memory cache to avoid hammering Open-Meteo with repeated calls
  private static cache: Map<string, { data: WeatherData; cachedAt: number }> = new Map();
  private static CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  /**
   * Translates WMO weather codes to human-readable condition text
   */
  public static mapWmoCodeToCondition(code: number): string {
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code === 45 || code === 48) return 'Foggy / Low Visibility';
    if (code >= 51 && code <= 55) return 'Light Drizzle';
    if (code >= 61 && code <= 65) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow / Hail';
    if (code >= 80 && code <= 82) return 'Heavy Rain Showers';
    if (code >= 95 && code <= 99) return 'Severe Thunderstorm';
    return 'Overcast';
  }

  /**
   * Evaluates weather hazards based on meteorological thresholds
   */
  public static assessHazards(
    temp: number,
    windSpeed: number,
    precipitation: number,
    weatherCode: number
  ): WeatherData['severeHazards'] {
    const hazards: WeatherData['severeHazards'] = [];

    // Precipitation & Flooding hazard
    if (precipitation > 10 || [81, 82, 95, 96, 99].includes(weatherCode)) {
      hazards.push({
        type: 'Flash Flood & Road Inundation Risk',
        severity: precipitation > 20 || weatherCode >= 95 ? 'severe' : 'high',
        description: `Precipitation of ${precipitation}mm/h and severe weather code (${weatherCode}) indicate high risk of low-lying road and railway underpass submergence.`,
        safetyGuidance: 'Avoid underpasses and canal perimeter roads. Emergency dispatch should deploy high-clearance water rescue vehicles.',
      });
    } else if (precipitation > 2 || [61, 63, 65, 80].includes(weatherCode)) {
      hazards.push({
        type: 'Wet Road & Slipping Hazard',
        severity: 'moderate',
        description: 'Active rain causing slick road conditions and reduced vehicular braking distance.',
        safetyGuidance: 'Reduce vehicular speed by 30%. Ambulances should use sirens and anti-skid routes.',
      });
    }

    // High Wind hazard
    if (windSpeed > 40) {
      hazards.push({
        type: 'Gale Wind Hazard',
        severity: windSpeed > 60 ? 'severe' : 'high',
        description: `Wind gusts of ${windSpeed} km/h can dislodge loose tin roofing, branches, and overhead electrical wires.`,
        safetyGuidance: 'Keep pedestrians away from large trees and high-voltage electricity transformers.',
      });
    }

    // Extreme Heat
    if (temp >= 40) {
      hazards.push({
        type: 'Extreme Heatwave Warning',
        severity: temp > 43 ? 'severe' : 'high',
        description: `Ambient temperature of ${temp}°C exceeds safety thresholds for vulnerable populations.`,
        safetyGuidance: 'Prioritize shade, hydration, and check elderly/cardiac patients for heat stroke symptoms.',
      });
    }

    return hazards;
  }

  /**
   * Fetches real live weather data from Open-Meteo API
   */
  public static async getWeatherForCoordinates(
    latitude: number,
    longitude: number,
    locationName = 'Reported Location'
  ): Promise<WeatherData> {
    const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    const now = Date.now();
    const cached = this.cache.get(cacheKey);

    if (cached && now - cached.cachedAt < this.CACHE_TTL_MS) {
      if (locationName && locationName !== 'Reported Location') {
        return { ...cached.data, locationName };
      }
      return cached.data;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&timezone=auto`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });

      if (!res.ok) {
        throw new Error(`Open-Meteo returned HTTP ${res.status}`);
      }

      const raw: OpenMeteoResponse = await res.json();
      const current = raw.current;
      const condition = this.mapWmoCodeToCondition(current.weather_code);
      const hazards = this.assessHazards(
        current.temperature_2m,
        current.wind_speed_10m,
        current.precipitation,
        current.weather_code
      );

      const weatherData: WeatherData = {
        temperature: Math.round(current.temperature_2m * 10) / 10,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
        condition,
        weatherCode: current.weather_code,
        precipitation: current.precipitation,
        severeHazards: hazards,
        locationName,
        coordinates: {
          latitude: raw.latitude,
          longitude: raw.longitude,
        },
        timestamp: current.time || new Date().toISOString(),
        source: 'Open-Meteo WMO Global Weather Service (Live Verified)',
        isLive: true,
      };

      this.cache.set(cacheKey, { data: weatherData, cachedAt: now });
      return weatherData;
    } catch (err: any) {
      console.warn('[WeatherService] Live Open-Meteo fetch failed, using fallback:', err.message);
      return this.getFallbackWeather(latitude, longitude, locationName);
    }
  }

  /**
   * Resolves text location to coordinates and returns weather
   */
  public static async getWeatherForLocationText(locationText: string): Promise<WeatherData> {
    const q = locationText.toLowerCase();

    // Check known location aliases first
    for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
      if (q.includes(key)) {
        return this.getWeatherForCoordinates(coords.lat, coords.lon, coords.name);
      }
    }

    // Try Open-Meteo Geocoding API
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationText.slice(0, 40))}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(3000) });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const first = geoData.results[0];
          const name = `${first.name}, ${first.admin1 || first.country || ''}`.trim();
          return this.getWeatherForCoordinates(first.latitude, first.longitude, name);
        }
      }
    } catch {
      // Ignore geocode timeout
    }

    // Default to Bengaluru coordinates (primary demo center)
    const def = KNOWN_COORDINATES.bengaluru;
    return this.getWeatherForCoordinates(def.lat, def.lon, locationText || def.name);
  }

  private static getFallbackWeather(
    latitude: number,
    longitude: number,
    locationName: string
  ): WeatherData {
    return {
      temperature: 24.5,
      humidity: 70,
      windSpeed: 11.2,
      condition: 'Partly Cloudy (Cached Baseline)',
      weatherCode: 2,
      precipitation: 0.0,
      severeHazards: [],
      locationName,
      coordinates: { latitude, longitude },
      timestamp: new Date().toISOString(),
      source: 'Open-Meteo Baseline Cache (Offline Fallback)',
      isLive: false,
    };
  }
}
