import {Request, Response} from 'express';
import {getCollection} from '../config/mongo';
import {sendData, sendError} from '../ultil/ultil';
import {User} from "../models/users";
import {Teacher} from "../models/teacher";
import {PgStatisticsByClass} from '../models/postgres/PgStatisticsByClass';
import {School} from "../models/school";
import '../models/associations';
import {Op} from "sequelize";
import {Class} from "../models/class";

//thống kê theo danh sách lớp
export const statisticDailyReportByClass = async (req: Request, res: Response) => {
    try {
        const startDate = new Date(req.query.start_date as string);
        const endDate = new Date(req.query.end_date as string);
        const schoolID = parseInt(req.query.school_id as string, 10);

        if (isNaN(schoolID) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            res.status(400).json({error_code: 1, message: 'Invalid or empty report list'});
        }
        const reportData = await PgStatisticsByClass.findAll({
            where: {
                date_report: {
                    [Op.between]: [startDate, endDate]
                },
                ...(schoolID && {school_id: schoolID}),
            }
        });

        const classInfo = await Class.findAll({
            where: {school_id: schoolID},
            attributes: ['id', 'name']
        });

        const reportMap = new Map<number, Set<string>>();
        for (const report of reportData as any[]) {
            const classId = report.class_id;
            const dateReport = new Date(report.date_report).toISOString().split('T')[0];

            if (!reportMap.has(classId)) {
                reportMap.set(classId, new Set());
            }

            reportMap.get(classId)?.add(dateReport);
        }

        const result = (classInfo as any[]).map(cls => {
            const daysSet = reportMap.get(cls.id);
            return {
                class_id: cls.id,
                class_name: cls.name,
                total_report: daysSet ? daysSet.size : 0
            };
        });

        sendData(res, result, 'Success');
    } catch (error) {
        console.error(error);
        res.status(500).json({error_code: 1, message: 'Failed'});
    }
};

//thống kê theo giáo vien
export const statisticDailyReportByTeacher = async (req: Request, res: Response): Promise<any> => {
    try {
        const startDate = new Date(req.query.start_date as string);
        const endDate = new Date(req.query.end_date as string);
        const schoolID = parseInt(req.query.school_id as string, 10);

        if (isNaN(schoolID) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({error_code: 1, message: 'Invalid or empty report list'});
        }

        const reportData = await PgStatisticsByClass.findAll({
            where: {
                date_report: {
                    [Op.between]: [startDate, endDate]
                },
                ...(schoolID && {school_id: schoolID}),
            }
        });

        const dataTeacher = await Teacher.findAll({
            where: {school_id: schoolID},
            include: [{
                model: User,
                as: 'teachers',
                attributes: ['id', 'name']
            }]
        });

        const reportMap = new Map<number, Set<string>>();
        for (const report of reportData as any[]) {
            const teacherId = report.teacher_id;
            const dateReport = new Date(report.date_report).toISOString();

            if (!reportMap.has(teacherId)) {
                reportMap.set(teacherId, new Set());
            }

            reportMap.get(teacherId)?.add(dateReport);
        }

        const result = (dataTeacher as any[]).map(teacher => {
            const teacherUser = teacher.teachers;
            const reportDays = reportMap.get(teacher.user_id)?.size || 0;

            return {
                teacher_id: teacher.user_id,
                teacher_name: teacherUser?.name || '',
                report_days: reportDays
            };
        });

        sendData(res, result, 'Success');
    } catch (error) {
        console.error(error);
        res.status(500).json({error_code: 1, message: 'Failed'});
    }
};

//thống kê top 5 trường

