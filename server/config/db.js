import mongoose from 'mongoose';

let connectionPromise;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Copy .env.example to .env and configure MongoDB.');
  }
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI)
      .then((connection) => {
        console.log('Connected to MongoDB');
        return connection;
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }
  return connectionPromise;
}
