import { EventEmitter } from 'events';
import { PgStatisticsByClass } from '../models/postgres/PgStatisticsByClass';
import { PgCommentViews } from '../models/postgres/PgCommentViews';
import { PgStatisticsByClassItf, PgCommentViewsItf } from '../controllers/Interface';
import {kafkaProducer} from "../kafka/kafka";

export const statisticsEmitter = new EventEmitter();

function isValidStatisticsData(data: PgStatisticsByClassItf): boolean {
    return !!(data.class_id && data.teacher_id && data.school_id && data.date_report);
}

function isValidCommentViewData(data: PgCommentViewsItf): boolean {
    return !!(data.class_id && data.school_id && data.student_id && data.view_date);
}

statisticsEmitter.on('send-daily-report', async (data: PgStatisticsByClassItf) => {
    try {
        if (!isValidStatisticsData(data)) {
            console.warn('Invalid data:', data);
            return;
        }

        await kafkaProducer.send({
            topic: 'statistics-created',
            messages: [
                {
                    key: `${data.class_id}-${data.teacher_id}`,
                    value: JSON.stringify(data)
                }
            ]
        });
    } catch (error) {
        console.error('Failed to create data:', error);
    }
});

statisticsEmitter.on('create-comment-view', async (data: PgCommentViewsItf) => {
    try {
        if (!isValidCommentViewData(data)) {
            console.warn('Invalid comment view data:', data);
            return;
        }

        await PgCommentViews.create({
            class_id: data.class_id,
            student_id: data.student_id,
            teacher_id: data.teacher_id ?? null,
            school_id: data.school_id,
            view_date: new Date(data.view_date),
            create_datetime: new Date(),
            update_datetime: new Date(),
        });

        console.log('Comment view recorded');
    } catch (error) {
        console.error('Failed to record comment view:', error);
    }
});