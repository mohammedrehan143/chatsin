import http from 'http';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { checkDatabaseConnection } from './services/database';
import { initializeWebSocket } from './websocket';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import conversationRoutes from './routes/conversationRoutes';

export function createApp(): { app: Express; server: http.Server } {
  const app = express();

  // Security Middleware
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const configuredOrigins = config.frontendUrl.split(',').map((u) => u.trim());
        if (
          configuredOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'Backend is running'
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/conversations', conversationRoutes);

  // Centralized Error Handling
  app.use(errorHandler);

  const server = http.createServer(app);

  // Attach WebSocket
  initializeWebSocket(server);

  return { app, server };
}

async function startServer() {
  const { server } = createApp();

  // Attempt database connectivity
  await checkDatabaseConnection();

  server.listen(config.port, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 Chat Backend Server running on port ${config.port}`);
    console.log(`📡 WebSocket ready on port ${config.port}`);
    console.log(`🛡️ CORS configured for origin: ${config.frontendUrl}`);
    console.log(`=======================================================`);
  });
}

// Direct execution
if (require.main === module) {
  startServer().catch(err => {
    console.error('Fatal startup error:', err);
    process.exit(1);
  });
}
