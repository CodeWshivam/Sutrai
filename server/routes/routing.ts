import { Router, Request, Response, NextFunction } from 'express';
import { RoutingService } from '../services/routingService';

const router = Router();

/**
 * POST /api/routing/calculate
 * Computes road route & alternatives via live OSRM / Haversine fallback
 */
router.post('/routing/calculate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { origin, destination, isEmergencyMode } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        error: 'Missing coordinates',
        message: 'Both origin and destination with latitude and longitude must be provided.',
      });
    }

    const routeData = await RoutingService.calculateRoute(origin, destination, Boolean(isEmergencyMode));

    res.json({
      success: true,
      route: routeData,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
