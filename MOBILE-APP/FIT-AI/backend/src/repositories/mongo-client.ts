import { MongoClient } from 'mongodb';
import { env } from '../config/env';

let client: MongoClient | null = null;
let isConnected = false;

export async function connectToMongo(): Promise<MongoClient> {
  if (isConnected && client) {
    return client;
  }

  client = new MongoClient(env.mongoUri);
  
  try {
    await client.connect();
    isConnected = true;
    console.log('Connected to MongoDB');
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function closeMongoConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    isConnected = false;
    console.log('MongoDB connection closed');
  }
}

export function getDb() {
  if (!client) {
    throw new Error('MongoDB client not initialized. Call connectToMongo() first.');
  }
  return client.db(env.mongoDbName);
}

export function getClient(): MongoClient | null {
  return client;
}