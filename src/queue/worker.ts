import Queue from 'bull';
import { redisConfig } from '../config/redis';
import dotenv from 'dotenv';
dotenv.config();
import { processStatisticsJob } from './statistics.processor';

const statisticsQueue = new Queue('statisticsQueue', {
    redis: redisConfig,
});

statisticsQueue.process(processStatisticsJob);

console.log('Worker listening to statisticsQueue...');
