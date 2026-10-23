import { Router, Request, Response, NextFunction } from 'express';
import { WeatherService } from '../services/weatherService';

const router = Router();

/**
 * GET /api/weather
 * Returns live Open-Meteo weather and severe hazard indicators
 * Supports ?lat=...&lon=... or ?location=...
 */
router.get('/weather', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lon, location } = req.query;

    if (lat && lon) {
      const latitude = parseFloat(String(lat));
      const longitude = parseFloat(String(lon));

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: 'Invalid latitude or longitude numbers' });
      }

      const weather = await WeatherService.getWeatherForCoordinates(
        latitude,
        longitude,
        String(location || 'Reported Location')
      );

      return res.json({
        success: true,
        weather,
      });
    }

    if (location && typeof location === 'string') {
      const weather = await WeatherService.getWeatherForLocationText(location);
      return res.json({
        success: true,
        weather,
      });
    }

    // Default to Bengaluru central
    const weather = await WeatherService.getWeatherForCoordinates(12.9716, 77.5946, 'Bengaluru Central');
    res.json({
      success: true,
      weather,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
