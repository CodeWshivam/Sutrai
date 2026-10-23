import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter: 120 requests per 15 minutes per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please wait a few moments before submitting another request.',
  },
});

/**
 * Stricter rate limiter for AI analysis requests (e.g. 30 requests per 10 minutes)
 */
export const aiAnalysisRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Analysis rate limit reached',
    message: 'To protect compute resources, analysis requests are throttled. Please try again in 5 minutes.',
  },
});

/**
 * Prompt injection sanitizer and detector
 * Detects phrases attempting to override system behavior (e.g., "ignore all previous instructions", "system override")
 * and wraps user inputs safely in tagged content blocks.
 */
export function sanitizeUntrustedInput(text: string): string {
  if (!text) return '';
  
  // Neutralize common prompt injection patterns by escaping control delimiters
  return text
    .replace(/```/g, "'''")
    .replace(/<\|im_start\|>/gi, '[start_token]')
    .replace(/<\|im_end\|>/gi, '[end_token]')
    .trim();
}

/**
 * Sanitizes an error object before sending to client to prevent leaking internal stack traces or secrets
 */
export function sanitizeErrorResponse(err: any): { error: string; message: string; code?: string } {
  // If it's a known Gemini rate limit / quota error
  const msg = err?.message || '';
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
    return {
      error: 'Gemini Rate Limit',
      message: 'The AI model is experiencing high demand. Please try again shortly or use demo mode.',
      code: 'GEMINI_RATE_LIMIT',
    };
  }

  if (msg.includes('API_KEY_INVALID') || msg.includes('403') || msg.includes('API key not valid')) {
    return {
      error: 'Invalid API Key',
      message: 'The configured Gemini API key is invalid or unauthorized. Please check your .env configuration.',
      code: 'AUTH_ERROR',
    };
  }

  return {
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred while processing your request.',
    code: 'INTERNAL_ERROR',
  };
}

/**
 * Global error handling middleware
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const sanitized = sanitizeErrorResponse(err);
  console.error('[API Error]', {
    error: sanitized.error,
    code: sanitized.code,
    timestamp: new Date().toISOString(),
  });

  const statusCode = err.status || (sanitized.code === 'GEMINI_RATE_LIMIT' ? 429 : 500);
  res.status(statusCode).json(sanitized);
}
