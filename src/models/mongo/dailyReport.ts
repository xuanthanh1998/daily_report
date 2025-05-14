import mongoose, {Schema, Document} from 'mongoose';

export interface IDailyReport extends Document {
    study_report?: string | null;
    other_report?: string | null;
    date_report: Date;
    student_id: number;
    teacher_id: number;
    class_id: number;
    create_datetime: Date;
    update_datetime: Date;
}

const DailyReportSchema: Schema = new Schema(
    {
        study_report: {type: String, default: null},
        other_report: {type: String, default: null},
        date_report: {type: Date, required: true},
        student_id: {type: Number, required: true},
        teacher_id: {type: Number, required: true},
        class_id: {type: Number, required: true}
    },
    {
        collection: 'daily_report',
        timestamps: {
            createdAt: 'create_datetime',
            updatedAt: 'update_datetime'
        },
        versionKey: false
    }
);

export default mongoose.model<IDailyReport>('DailyReport', DailyReportSchema);
