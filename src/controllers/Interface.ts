export interface SendDailyReportInput {
    student_id: number;
    date_report: string;
    teacher_id: number;
    class_id: number;
    study_report?: string;
    other_report?: string;
}

export interface PgStatisticsByClassItf {
    class_id: number;
    teacher_id: number;
    school_id: number;
    date_report: Date;
    create_datetime: Date;
    update_datetime: Date;
}

export interface PgCommentViewsItf {
    class_id: number;
    teacher_id: number;
    school_id: number;
    student_id: number;
    view_date: Date;
    create_datetime: Date;
    update_datetime: Date;
}