import app from './app';
import { env } from './config/env';
import { connectToMongo, closeMongoConnection } from './repositories/mongo-client';

async function startServer() {
  try {
    // Connect to MongoDB
    await connectToMongo();
    
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`FIT-AI backend listening on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await closeMongoConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await closeMongoConnection();
  process.exit(0);
});

startServer();
