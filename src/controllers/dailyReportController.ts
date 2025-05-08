import {Request, Response} from 'express';
import {getCollection} from '../config/mongo';
import {sendData} from "../ultil/ultil";
import {Student} from '../models/student';
import {Teacher} from '../models/teacher';
import {Class} from '../models/class';
import {User} from '../models/users';
import {School} from '../models/school';
import '../models/associations';
import {SchoolPrincipal} from "../models/school_principal";

//gửi nhận xét hàng ngày
export const sendDailyReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const reports = req.body;

        if (!Array.isArray(reports) || reports.length === 0) {
            res.status(400).json({error_code: 1, message: 'Invalid or empty report list'});
        }

        const collection = await getCollection('daily_report');
        const insertedResults = [];

        for (const report of reports) {
            try {
                console.log('report', report);
                const dataReport = await collection.findOne({
                    student_id: report.student_id,
                    date_report: new Date(report.date_report),
                    teacher_id: report.teacher_id
                });
                console.log('dataReport', dataReport);
                if (dataReport) {
                    const updateFields: any = {};

                    if (report.study_report !== undefined) {
                        updateFields.study_report = report.study_report;
                    }

                    if (report.other_report !== undefined) {
                        updateFields.other_report = report.other_report;
                    }

                    const dataUpdate = await collection.findOneAndUpdate(
                        {_id: dataReport._id},
                        {
                            $set: updateFields
                        },
                        {returnDocument: 'after'}
                    );
                    sendData(res, dataUpdate, 'update completed');
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
                    insertedResults.push({success: true, insertedId: result.insertedId});
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
export const getDailyReportsByParent = async (req: Request, res: Response) => {
    try {
        const studentId = parseInt(req.query.student_id as string, 10);
        const dateReport = new Date(req.query.date_report as string);

        const collection = await getCollection('daily_report');
        const reports = await collection.find({
            student_id: studentId,
            date_report: dateReport
        }).toArray();

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
        sendData(res, dataReports, 'Success');
    } catch (error) {
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


export const getDailyReportsByPrincipal = async (req: Request, res: Response): Promise<any> => {
    try {
        const dateReport = new Date(req.query.date_report as string);
        const userID = parseInt(req.query.user_id as string, 10);
        const collection = await getCollection('daily_report');

        if (isNaN(userID) || isNaN(dateReport.getTime())) {
            return res.status(400).json({
                error_code: 1,
                message: 'Invalid query parameters'
            });
        }

        const dataClass: any = await School.findOne({
            attributes: ['id', 'name'],
            include: [
                {
                    model: User,
                    as: 'principals',
                    where: { id: userID },
                    attributes: [],
                    through: { attributes: [] }
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
            return res.status(404).json({ error_code: 2, message: 'School not found or no classes' });
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
        console.error(error);
        res.status(500).json({ error_code: 1, message: 'Failed' });
    }
};

