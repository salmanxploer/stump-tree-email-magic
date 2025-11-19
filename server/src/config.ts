import dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const required = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable ${key}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 4000),
  clientUrls: (process.env.CLIENT_URLS ?? process.env.CLIENT_URL ?? 'http://localhost:5173')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0),
  mongoUri: required(process.env.MONGODB_URI, 'MONGODB_URI'),
  jwtSecret: required(process.env.JWT_SECRET, 'JWT_SECRET'),
  googleClientId: required(process.env.GOOGLE_CLIENT_ID, 'GOOGLE_CLIENT_ID'),
  googleClientSecret: required(process.env.GOOGLE_CLIENT_SECRET, 'GOOGLE_CLIENT_SECRET'),
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:4000/auth/google/callback',
  adminEmails: (process.env.ADMIN_EMAILS ?? 'admin@bubt.edu')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0),
};
