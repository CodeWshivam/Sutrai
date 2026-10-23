import { Router, Request, Response, NextFunction } from 'express';
import { DirectoryService } from '../services/directoryService';

const router = Router();

/**
 * GET /api/directory
 * Search and filter official emergency & civic services directory
 */
router.get('/directory', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, search, jurisdiction } = req.query;

    const entries = DirectoryService.listEntries({
      category: category ? String(category) : undefined,
      search: search ? String(search) : undefined,
      jurisdiction: jurisdiction ? String(jurisdiction) : undefined,
    });

    res.json({
      success: true,
      count: entries.length,
      entries,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/directory/:id
 * Retrieve specific directory entry
 */
router.get('/directory/:id', (req: Request, res: Response) => {
  const entry = DirectoryService.getEntryById(String(req.params.id));
  if (!entry) {
    return res.status(404).json({ error: 'Not Found', message: `Directory entry ${req.params.id} does not exist.` });
  }

  res.json({
    success: true,
    entry,
  });
});

export default router;
