/**
 * Database Connection - Config Layer
 */
import { MongoClient } from 'mongodb';
import { config } from '../index.js';

let client = null;
let db = null;

export async function connectDB() {
  if (db) return db;

  try {
    const uri = config.mongodbUri;
    
    // Add retry settings
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      retryWrites: true,
      retryReads: true,
    };
    
    client = new MongoClient(uri, options);
    await client.connect();
    console.log(`Connected to MongoDB: ${config.dbName}`);
    db = client.db(config.dbName);
    console.log(`Connected to MongoDB: ${config.dbName}`);
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}

export function getDB() {
  if (!db) throw new Error('Database not connected');
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB disconnected');
  }
}

export { ObjectId } from 'mongodb';
