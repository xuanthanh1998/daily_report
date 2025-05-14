import {Request, Response} from 'express';
import {sendData} from "../ultil/ultil";
import {Student, studentAttributes} from '../models/student';
import {Class, class_Attributes} from '../models/class';
import {User} from '../models/users';
import {School, schoolAttributes} from '../models/school';
import '../models/associations';
import {PgCommentViews} from '../models/postgres/PgCommentViews';
import DailyReport, {IDailyReport} from "../models/mongo/dailyReport";
import {SendDailyReportInput} from "./Interface";
import {statisticsEmitter} from '../events/dailyReportEvent';

//gửi nhận xét hàng ngày
export const sendDailyReport = async (req: Request, res: Response): Promise<any> => {
    try {
        const reports = req.body as SendDailyReportInput[];

        if (!Array.isArray(reports) || reports.length === 0) {
            return res.status(400).json({error_code: 1, message: 'Invalid or empty report list'});
        }

        const now = new Date();
        const classIds = [...new Set(reports.map(r => r.class_id))];
        const classList = await Class.findAll({where: {id: classIds}}) as unknown as class_Attributes[];
        const classMap = new Map<number, any>();
        classList.forEach(cls => classMap.set(cls.id, cls));

        const bulkOps = [];
        const statistics = [];

        for (const report of reports) {
            const {
                student_id,
                date_report,
                teacher_id,
                class_id,
                study_report,
                other_report
            } = report;

            const dataClass = classMap.get(class_id);
            if (!dataClass) continue;

            const filter = {
                student_id,
                teacher_id,
                date_report: new Date(date_report)
            };

            const update = {
                $set: {
                    class_id,
                    study_report,
                    other_report,
                    update_datetime: now
                },
                $setOnInsert: {
                    create_datetime: now
                }
            };

            bulkOps.push({
                updateOne: {
                    filter,
                    update,
                    upsert: true
                }
            });

            statistics.push({
                class_id,
                teacher_id,
                school_id: dataClass.school_id,
                date_report
            });
        }

        if (bulkOps.length === 0) {
            return res.status(400).json({error_code: 2, message: 'No valid reports to process'});
        }
        const result = await DailyReport.bulkWrite(bulkOps);
        statistics.forEach(stat => {
            statisticsEmitter.emit('create-statistics', stat);
        });
        sendData(res, result, 'Bulk upsert completed');
    } catch (error) {
        console.error('Unexpected error in sendDailyReport:', error);
        res.status(500).json({error_code: 1, message: 'Internal server error'});
    }
};


//phụ huynh xem nhận xét hàng ngày
export const getDailyReportsByParent = async (req: Request, res: Response): Promise<void> => {
    try {
        const studentId = parseInt(req.query.student_id as string, 10);
        const dateReport = new Date(req.query.date_report as string);

        if (isNaN(studentId) || isNaN(dateReport.getTime())) {
            res.status(400).json({
                error_code: 1,
                message: 'Invalid query parameters',
            });
            return;
        }

        const reports = await DailyReport.find({
            student_id: studentId,
            date_report: dateReport,
        }).lean() as unknown as IDailyReport[];

        if (!reports || reports.length === 0) {
            res.status(404).json({error_code: 2, message: 'No reports found'});
            return;
        }

        const teacherIDs = reports.map(r => r.teacher_id);

        const [teachers, dataStudent] = await Promise.all([
            User.findAll({
                where: {id: teacherIDs},
                attributes: ['name', 'id'],
                raw: true,
            }),
            Student.findOne({where: {id: studentId}, raw: true}) as unknown as studentAttributes,
        ]);

        const teacherMap = new Map<number, any>();
        teachers.forEach((t: any) => {
            teacherMap.set(Number(t.id), t);
        });

        const dataReports = reports.map((r) => ({
            ...r,
            teacher: teacherMap.get(r.teacher_id) || null,
        }));

        const dataCommentView = await PgCommentViews.findOne({
            where: {
                class_id: dataStudent.class_id,
                school_id: dataStudent.school_id,
                view_date: dateReport,
            },
        });
        if (!dataCommentView) {
            statisticsEmitter.emit('create-comment-view', {
                class_id: dataStudent.class_id,
                student_id: studentId,
                school_id: dataStudent.school_id,
                view_date: new Date(),
                create_datetime: new Date(),
                update_datetime: new Date(),
            });
        }

        sendData(res, dataReports, 'Success');
    } catch (error) {
        console.error('getDailyReportsByParent error:', error);
        res.status(500).json({error_code: 1, message: 'Failed'});
    }
};


//giáo viên xem nhận xét hàng ngày
export const getDailyReportsByTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        const classID = parseInt(req.query.class_id as string, 10);
        const teacherID = parseInt(req.query.teacher_id as string, 10);
        const dateReport = new Date(req.query.date_report as string);

        if (isNaN(classID) || isNaN(teacherID) || isNaN(dateReport.getTime())) {
            res.status(400).json({
                error_code: 1,
                message: 'Invalid query parameters'
            });
        }

        const dataClass = await Class.findOne({
            where: {id: classID},
            attributes: ['id', 'name'],
            include: [
                {
                    model: Student,
                    as: 'students',
                    attributes: ['id', 'full_name', 'birthday'],
                }
            ]
        }) as unknown as class_Attributes;

        if (!dataClass || !dataClass.students) {
            res.status(404).json({error_code: 2, message: 'Class not found or no students'});
        }

        const reports = await DailyReport.find({
            teacher_id: teacherID,
            class_id: classID,
            date_report: dateReport
        }) as unknown as IDailyReport[];

        const reportMap = new Map<number, any>();
        reports.forEach(r => {
            reportMap.set(r.student_id, r);
        });

        const result = dataClass.students.map(student => {
            const report = reportMap.get(student.id);
            return {
                student_id: student.id,
                full_name: student.full_name,
                birthday: student.birthday,
                study_report: report?.study_report ?? null,
                other_report: report?.other_report ?? null,
            };
        });

        sendData(res, result, 'Success');
    } catch (error) {
        res.status(500).json({error_code: 1, message: 'Failed'});
    }
};

//lãnh đạo xem thống kê nhận xét hàng ngày của từng lớp
export const getDailyReportsByPrincipal = async (req: Request, res: Response): Promise<void> => {
    try {
        const dateReport = new Date(req.query.date_report as string);
        const userID = parseInt(req.query.user_id as string, 10);
        const schoolID = parseInt(req.query.school_id as string, 10);

        if (isNaN(userID) || isNaN(dateReport.getTime()) || isNaN(schoolID)) {
            res.status(400).json({
                error_code: 1,
                message: 'Invalid query parameters'
            });
        }

        const schoolData = await School.findOne({
            where: {id: schoolID},
            attributes: ['id', 'name'],
            include: [
                {
                    model: User,
                    as: 'principals',
                    where: {id: userID},
                    attributes: [],
                    through: {attributes: []}
                },
                {
                    model: Class,
                    as: 'class',
                    attributes: ['id', 'name', 'total_student'],
                    include: [
                        {
                            model: User,
                            as: 'teacher',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });

        if (!schoolData) {
            res.status(404).json({error_code: 2, message: 'School not found or no classes'});
            return;
        }

        const schoolObj = schoolData.toJSON() as schoolAttributes;

        const classList = schoolObj.class || [];
        const classIds = classList.map((cls: any) => cls.id);

        const reportStats = await DailyReport.aggregate([
            {
                $match: {
                    class_id: {$in: classIds},
                    date_report: dateReport
                }
            },
            {
                $group: {
                    _id: "$class_id",
                    count: {$sum: 1}
                }
            }
        ]);

        const reportMap = new Map<number, number>();
        reportStats.forEach(stat => {
            reportMap.set(stat._id, stat.count);
        });

        const reviewedClasses = classList.map(cls => {
            const reviewed = reportMap.get(cls.id) || 0;
            return {
                ...cls,
                student_reviewed: reviewed
            };
        });

        const studentCount = await Student.count({where: {school_id: schoolObj.id}});

        const totalReviewed = reportStats.reduce((sum, stat) => sum + stat.count, 0);

        const result = {
            id: schoolObj.id,
            name: schoolObj.name,
            total_student: studentCount,
            student_reviewed: totalReviewed,
            class: reviewedClasses
        };

        sendData(res, result, 'Success');
    } catch (error) {
        console.error('Error in getDailyReportsByPrincipal:', error);
        res.status(500).json({error_code: 1, message: 'Failed'});
    }
};