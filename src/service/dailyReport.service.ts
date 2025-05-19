import {kafka} from '../kafka/kafka';
import Queue from 'bull';
import {PgStatisticsByClassItf} from "../controllers/Interface";
import {PgStatisticsByClass} from "../models/postgres/PgStatisticsByClass";
import {redisConfig} from '../config/redis';

const statisticsQueue = new Queue('statisticsQueue', {
    redis: redisConfig,
});

statisticsQueue.process(async (job) => {
    try {
        const data: PgStatisticsByClassItf = job.data;

        if (!data.class_id || !data.teacher_id || !data.school_id || !data.date_report) {
            console.warn('Invalid statistics data:', data);
            return;
        }

        const [record, created] = await PgStatisticsByClass.findOrCreate({
            where: {
                class_id: data.class_id,
                teacher_id: data.teacher_id,
                school_id: data.school_id,
                date_report: new Date(data.date_report),
            },
            defaults: {
                create_datetime: new Date(),
                update_datetime: new Date(),
            },
        });

        if (created) {
            console.log('Data saved:', data);
        } else {
            console.log('Data already exists:', data);
        }
    } catch (error) {
        console.error('Failed to process job:', error);
    }
});


export async function runConsumer() {
    const consumer = kafka.consumer({groupId: 'statistics-consumer-group'});
    await consumer.connect();
    await consumer.subscribe({topic: 'statistics-created', fromBeginning: true});

    await consumer.run({
        eachMessage: async ({message}) => {
            if (!message.value) return;

            try {
                const data: PgStatisticsByClassItf = JSON.parse(message.value.toString());
                await statisticsQueue.add(data, {
                    attempts: 3,
                    backoff: 5000,
                });
            } catch (error) {
                console.error('Invalid JSON message:', error);
            }
        },
    });

    console.log('Kafka consumer started and listening...');
}

runConsumer().catch(console.error);
