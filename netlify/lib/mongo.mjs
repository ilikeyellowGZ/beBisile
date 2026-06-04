import { MongoClient } from 'mongodb';

let clientPromise;

export const getDatabase = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured.');
  clientPromise ??= new MongoClient(process.env.MONGODB_URI).connect();
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DATABASE || 'bisile');
};
