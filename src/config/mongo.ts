import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!, {
            dbName: 'mydb',
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};
