import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Gemini AI configuration
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),
  
  // Supabase configuration
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
});

const parsedEnv = envSchema.parse(process.env);

export const config = {
  port: parseInt(parsedEnv.PORT, 10),
  nodeEnv: parsedEnv.NODE_ENV,
  clientOrigin: parsedEnv.CLIENT_ORIGIN,
  gemini: {
    apiKey: parsedEnv.GEMINI_API_KEY,
    model: parsedEnv.GEMINI_MODEL,
    isConfigured: Boolean(parsedEnv.GEMINI_API_KEY && parsedEnv.GEMINI_API_KEY.trim().length > 0),
  },
  supabase: {
    url: parsedEnv.SUPABASE_URL,
    publishableKey: parsedEnv.SUPABASE_PUBLISHABLE_KEY,
    serviceRoleKey: parsedEnv.SUPABASE_SERVICE_ROLE_KEY,
    isConfigured: Boolean(
      parsedEnv.SUPABASE_URL && 
      parsedEnv.SUPABASE_URL.trim().length > 0 &&
      (parsedEnv.SUPABASE_PUBLISHABLE_KEY || parsedEnv.SUPABASE_SERVICE_ROLE_KEY)
    ),
  },
};
