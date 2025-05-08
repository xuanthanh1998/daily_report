import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'your_database_name';

let db: Db;

export const connectMongo = async (): Promise<Db> => {
    if (db) return db;

    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log(`✅ MongoDB connected to ${dbName}`);
    return db;
};

export const getCollection = async (collectionName: string) => {
    const db = await connectMongo();
    return db.collection(collectionName);
};
