import {Request, Response} from 'express';
import {getCollection} from '../config/mongo';
import {sendData} from "../ultil/ultil";
import {Student} from '../models/student';
import {Class} from '../models/class';
import {User} from '../models/users';
import {School} from '../models/school';
import '../models/associations';
import {PgStatisticsByClass} from '../models/postgres/PgStatisticsByClass';
import {PgCommentViews} from '../models/postgres/PgCommentViews';

//gửi nhận xét hàng ngày
export const sendDailyReport = async (req: Request, res: Response): Promise<any> => {
    try {
        const reports = req.body;

        if (!Array.isArray(reports) || reports.length === 0 || isNaN(reports[0].student_id)) {
            res.status(400).json({error_code: 1, message: 'Invalid or empty report list'});
        }

        const collection = await getCollection('daily_report');
        const insertedResults = [];

        for (const report of reports) {
            try {
                const existing = await collection.findOne({
                    student_id: report.student_id,
                    date_report: new Date(report.date_report),
                    teacher_id: report.teacher_id
                });

                if (existing) {
                    const updateFields: any = {};

                    if (report.study_report !== undefined) updateFields.study_report = report.study_report;
                    if (report.other_report !== undefined) updateFields.other_report = report.other_report;

                    await collection.findOneAndUpdate(
                        {_id: existing._id},
                        {$set: updateFields},
                        {returnDocument: 'after'}
                    );

                    insertedResults.push({success: true, type: 'updated', _id: existing._id});
                } else {
                    const dataClass: any = await Class.findOne({
                        where: {id: report.class_id}
                    })
                    if (!dataClass) {
                        res.status(400).json({error_code: 1, message: 'not found class'});
                    } else {
                        const result = await collection.insertOne({
                            study_report: report.study_report,
                            other_report: report.other_report,
                            date_report: new Date(report.date_report),
                            student_id: report.student_id,
                            teacher_id: report.teacher_id,
                            class_id: report.class_id,
                            create_datetime: new Date(),
                            update_datetime: new Date(),
                        });

                        await PgStatisticsByClass.create({
                            class_id: report.class_id,
                            teacher_id: report.teacher_id,
                            school_id: dataClass.school_id,
                            date_report: new Date(report.date_report),
                            create_datetime: new Date(),
                            update_datetime: new Date(),
                        });

                        insertedResults.push({success: true, type: 'inserted', insertedId: result.insertedId});
                    }
                }
            } catch (err) {
                insertedResults.push({success: false, error: 'Failed to insert reports', report});
            }
        }
        sendData(res, insertedResults, 'Insert process completed');
    } catch (error) {
        res.status(500).json({error_code: 1, message: 'Failed'});
    }
};

//phụ huynh xem nhận xét hàng ngày
export const getDailyReportsByParent = async (req: Request, res: Response): Promise<any> => {
    try {
        const studentId = parseInt(req.query.student_id as string, 10);
        const dateReport = new Date(req.query.date_report as string);
        if (isNaN(studentId) || isNaN(dateReport.getTime())) {
            return res.status(400).json({
                error_code: 1,
                message: 'Invalid query parameters'
            });
        }

        const collection = await getCollection('daily_report');
        const reports = await collection.find(
            {
                student_id: studentId,
                date_report: dateReport
            },
            {
                projection: {
                    _id: 0,
                    class_id: 1,
                    teacher_id: 1,
                    study_report: 1,
                    other_report: 1,
                    date_report: 1
                }
            }
        ).toArray();

        if (!reports || reports.length === 0) {
            return res.status(404).json({error_code: 2, message: 'No reports found'});
        } else {
            const teacherIDs = reports.map(r => r.teacher_id);
            const [teachers] = await Promise.all([
                User.findAll({where: {id: teacherIDs}, attributes: ['name', 'id']})
            ]);

            const teacherMap = new Map<number, any>();
            teachers.forEach((s: any) => {
                teacherMap.set(Number(s.id), s);
            });

            const dataReports = reports.map(r => ({
                ...r,
                teacher: teacherMap.get(r.teacher_id) || null
            }));

            const dataStudent: any = await Student.findOne({
                where: {id: studentId},
            })
            const dataCommentView = await PgCommentViews.findOne({
                where: {
                    class_id: dataStudent.class_id,
                    school_id: dataStudent.school_id,
                    view_date: dateReport,
                }
            })
            console.log('ạhsdkjsahdk', dataCommentView)
            if (!dataCommentView) {
                await PgCommentViews.create({
                    class_id: dataStudent.class_id,
                    student_id: studentId,
                    school_id: dataStudent.school_id,
                    view_date: new Date(),
                    create_datetime: new Date(),
                    update_datetime: new Date(),
                })
            }
            sendData(res, dataReports, 'Success');
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({error_code: 1, message: 'Failed'});
    }
};


//giáo viên xem nhận xét hàng ngày
export const getDailyReportsByTeacher = async (req: Request, res: Response): Promise<any> => {
    try {
        const classID = parseInt(req.query.class_id as string, 10);
        const teacherID = parseInt(req.query.teacher_id as string, 10);
        const dateReport = new Date(req.query.date_report as string);

        if (isNaN(classID) || isNaN(teacherID) || isNaN(dateReport.getTime())) {
            return res.status(400).json({
                error_code: 1,
                message: 'Invalid query parameters'
            });
        }

        const collection = await getCollection('daily_report');

        const dataClass: any = await Class.findOne({
            where: {id: classID},
            attributes: ['id', 'name'],
            include: [
                {
                    model: Student,
                    as: 'students',
                    attributes: ['id', 'full_name', 'birthday'],
                }
            ]
        });

        if (!dataClass || !dataClass.students) {
            return res.status(404).json({error_code: 2, message: 'Class not found or no students'});
        }

        const reports = await collection.find({
            teacher_id: teacherID,
            class_id: classID,
            date_report: dateReport
        }).toArray();

        const reportMap = new Map<number, any>();
        reports.forEach(r => {
            reportMap.set(r.student_id, r);
        });

        const result = dataClass.students.map((student: any) => {
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
export const getDailyReportsByPrincipal = async (req: Request, res: Response): Promise<any> => {
    try {
        const dateReport = new Date(req.query.date_report as string);
        const userID = parseInt(req.query.user_id as string, 10);
        const schoolID = parseInt(req.query.school_id as string, 10);
        const collection = await getCollection('daily_report');

        if (isNaN(userID) || isNaN(dateReport.getTime()) || isNaN(schoolID)) {
            return res.status(400).json({
                error_code: 1,
                message: 'Invalid query parameters'
            });
        }

        const dataClass: any = await School.findOne({
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

        if (!dataClass) {
            return res.status(404).json({error_code: 2, message: 'School not found or no classes'});
        }

        const dataJSON = dataClass.toJSON();
        const classList = dataJSON.class || [];

        let totalReviewed = 0;

        const reviewedMap = await Promise.all(
            classList.map(async (cls: any) => {
                const count = await collection.countDocuments({
                    class_id: cls.id,
                    date_report: dateReport
                });
                totalReviewed += count;
                return {
                    ...cls,
                    student_reviewed: count
                };
            })
        );

        const studentCount = await Student.count({
            where: {
                school_id: dataJSON.id
            }
        });

        const result = {
            id: dataJSON.id,
            name: dataJSON.name,
            total_student: studentCount,
            student_reviewed: totalReviewed,
            class: reviewedMap
        };

        sendData(res, result, 'Success');
    } catch (error) {
        res.status(500).json({error_code: 1, message: 'Failed'});
    }
};

