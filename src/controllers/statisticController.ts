import {Request, Response} from 'express';
import {sendData, sendError} from '../ultil/ultil';
import {User} from "../models/users";
import {Teacher, teacherAttributes} from "../models/teacher";
import {PgStatisticsByClass} from '../models/postgres/PgStatisticsByClass';
import {School, schoolAttributes} from "../models/school";
import '../models/associations';
import {Op, QueryTypes} from "sequelize";
import {Class, class_Attributes} from "../models/class";
import {PgCommentViews} from "../models/postgres/PgCommentViews";
import {PgCommentViewsItf, PgStatisticsByClassItf} from "./Interface";
import {pgSequelize} from "../config/postgres";

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
        }) as unknown as PgStatisticsByClassItf[];

        const classInfo = await Class.findAll({
            where: {school_id: schoolID},
            attributes: ['id', 'name']
        }) as unknown as class_Attributes[];

        const reportMap = new Map<number, Set<string>>();
        for (const report of reportData) {
            const classId = report.class_id;
            const dateReport = new Date(report.date_report).toISOString().split('T')[0];

            if (!reportMap.has(classId)) {
                reportMap.set(classId, new Set());
            }

            reportMap.get(classId)?.add(dateReport);
        }

        const result = classInfo.map(cls => {
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
export const statisticDailyReportByTeacher = async (req: Request, res: Response): Promise<void> => {
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
        }) as unknown as PgStatisticsByClassItf[];

        const dataTeacher = await Teacher.findAll({
            where: {school_id: schoolID},
            include: [{
                model: User,
                as: 'teachers',
                attributes: ['id', 'name']
            }]
        }) as unknown as teacherAttributes[];

        const reportMap = new Map<number, Set<string>>();
        for (const report of reportData) {
            const teacherId = report.teacher_id;
            const dateReport = new Date(report.date_report).toISOString();

            if (!reportMap.has(teacherId)) {
                reportMap.set(teacherId, new Set());
            }

            reportMap.get(teacherId)?.add(dateReport);
        }

        const result = dataTeacher.map(teacher => {
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


//Thống kê chung của hệ thống
export const getSystemStatistic = async (req: Request, res: Response): Promise<void> => {
    try {
        const startDate = new Date(req.query.start_date as string);
        const endDate = new Date(req.query.end_date as string);

        if (!startDate || !endDate) {
            res.status(400).json({ error_code: 1, message: 'Missing start_date or end_date' });
            return;
        }

        const data = await pgSequelize.query(
            `
                SELECT
                    school_id,
                    SUM(total_comments) AS total_comments
                FROM V_TOP5_COMMENT_SCHOOLS_BY_DAY
                WHERE bucket BETWEEN :start AND :end
                GROUP BY school_id
                ORDER BY total_comments DESC
                    LIMIT 5
            `,
            {
                replacements: { start: startDate, end: endDate },
                type: QueryTypes.SELECT,
            }
        );

        sendData(res, data, 'Success');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error_code: 1, message: 'Failed' });
    }
}


//thống kê lượt xem theo danh sách lớp
export const reportViewByClass = async (req: Request, res: Response): Promise<any> => {
    try {
        const startDate = new Date(req.query.start_date as string);
        const endDate = new Date(req.query.end_date as string);
        const schoolID = parseInt(req.query.school_id as string, 10);

        if (isNaN(schoolID) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({error_code: 1, message: 'Invalid or empty report list'});
        }

        const reportData = await PgCommentViews.findAll({
            where: {
                view_date: {
                    [Op.between]: [startDate, endDate]
                },
                ...(schoolID && {school_id: schoolID}),
            }
        }) as unknown as PgCommentViewsItf[];

        const classInfo = await Class.findAll({
            where: {school_id: schoolID},
            attributes: ['id', 'name']
        });

        const classViewMap = new Map<number, number>();
        for (const report of reportData) {
            const classId = report.class_id;
            classViewMap.set(classId, (classViewMap.get(classId) || 0) + 1);
        }

        const result = classInfo.map(cls => {
            const clsData = cls.toJSON() as class_Attributes;
            return {
                class_id: clsData.id,
                class_name: clsData.name,
                view_count: classViewMap.get(clsData.id) || 0
            };
        });

        sendData(res, result, 'Success');
    } catch (error) {
        console.error(error);
        res.status(500).json({error_code: 1, message: 'Failed'});
    }
};
