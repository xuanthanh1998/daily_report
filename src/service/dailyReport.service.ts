import { kafka } from '../kafka/kafka';
import Queue from 'bull';
import { PgStatisticsByClassItf } from '../controllers/Interface';
import { redisConfig } from '../config/redis';

const statisticsQueue = new Queue('statisticsQueue', {
    redis: redisConfig,
});

export async function runConsumer() {
    const consumer = kafka.consumer({ groupId: 'statistics-consumer-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'statistics-created', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) return;

            try {
                const data: PgStatisticsByClassItf = JSON.parse(message.value.toString());
                await statisticsQueue.add(data, {
                    attempts: 3,
                    backoff: 5000,
                });
                console.log('Job added to statisticsQueue:', data);
            } catch (error) {
                console.error('Invalid JSON message:', error);
            }
        },
    });

    console.log('Kafka consumer started and listening...');
}
