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
      origin: [config.frontendUrl, 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'chat-app-backend',
      timestamp: new Date().toISOString()
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

  server.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Chat Backend Server running on http://localhost:${config.port}`);
    console.log(`📡 WebSocket ready on ws://localhost:${config.port}`);
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
