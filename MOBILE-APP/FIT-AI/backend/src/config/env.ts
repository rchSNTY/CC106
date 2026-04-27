import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: requireEnv('JWT_SECRET', 'dev_jwt_secret_change_this'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  baseUrl: process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`,
  dbPath: path.resolve(process.cwd(), 'data', 'db.json'),
  uploadsDir: path.resolve(process.cwd(), 'uploads', 'avatars'),
  // MongoDB configuration
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017',
  mongoDbName: process.env.MONGO_DB_NAME ?? 'fitai',
};
