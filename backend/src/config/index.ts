import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, ''),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chatapp?schema=public',
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_min_32_chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  },
  valkey: {
    uri: process.env.VALKEY_URI || '',
    host: process.env.VALKEY_HOST || 'localhost',
    port: parseInt((process.env.VALKEY_PORT?.match(/:?(\d+)$/)?.[1] || process.env.VALKEY_PORT || '6379'), 10),
    username: process.env.VALKEY_USERNAME || 'default',
    password: process.env.VALKEY_PASSWORD || ''
  },
  kafka: {
    broker: process.env.KAFKA_BROKER || 'localhost:9092',
    username: process.env.KAFKA_USERNAME || '',
    password: process.env.KAFKA_PASSWORD || ''
  }
};
