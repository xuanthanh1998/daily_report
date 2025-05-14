// database/mongoose.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/your_database_name';

export const connectMongo = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Mongoose connected to MongoDB');
    } catch (error) {
        console.error(' Mongoose connection error:', error);
        process.exit(1);
    }
};
