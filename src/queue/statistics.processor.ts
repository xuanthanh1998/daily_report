import { Job, DoneCallback } from 'bull';
import { PgStatisticsByClassItf } from '../controllers/Interface';
import { PgStatisticsByClass } from '../models/postgres/PgStatisticsByClass';

export const processStatisticsJob = async (job: Job, done: DoneCallback) => {
    try {
        const data: PgStatisticsByClassItf = job.data;

        if (!data.class_id || !data.teacher_id || !data.school_id || !data.date_report) {
            console.warn('Invalid statistics data:', data);
            return done(new Error('Invalid statistics data'));
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
            console.log('ℹData already exists:', data);
        }

        done();
    } catch (error) {
        console.error('Failed to process job:', error);
        done(error instanceof Error ? error : new Error(String(error)));
    }
};
