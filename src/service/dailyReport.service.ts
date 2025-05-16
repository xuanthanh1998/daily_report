import {kafka} from '../kafka/kafka';
import {AsyncQueue} from '../queue/queue';
import {PgStatisticsByClassItf} from "../controllers/Interface";
import {PgStatisticsByClass} from "../models/postgres/PgStatisticsByClass";

const queue = new AsyncQueue();

const consumer = kafka.consumer({groupId: 'statistics-consumer-group'});

async function createStatisticDailyReport(data: PgStatisticsByClassItf) {
    try {
         if (!data.class_id || !data.teacher_id || !data.school_id || !data.date_report) {
            console.warn('Invalid statistics data:', data);
            return;
        }
        const existingRecord = await PgStatisticsByClass.findOne({
            where: {
                class_id: data.class_id,
                teacher_id: data.teacher_id,
                school_id: data.school_id,
                date_report: new Date(data.date_report)
            }
        });

        if (existingRecord) {
            console.log('data already exist');
            return;
        }

        await PgStatisticsByClass.create({
            class_id: data.class_id,
            teacher_id: data.teacher_id,
            school_id: data.school_id,
            date_report: new Date(data.date_report),
            create_datetime: new Date(),
            update_datetime: new Date(),
        });

        console.log('Data saved:', data);
    } catch (error) {
        console.error('Failed to save data:', error);
    }
}

export async function runConsumer() {
    await consumer.connect();
    await consumer.subscribe({topic: 'statistics-created', fromBeginning: true});

    await consumer.run({
        eachMessage: async ({message}) => {
            if (!message.value) return;

            try {
                const data: PgStatisticsByClassItf = JSON.parse(message.value.toString());
                queue.enqueue(() => createStatisticDailyReport(data));
            } catch (error) {
                console.error('Invalid JSON message:', error);
            }
        }
    });
}
