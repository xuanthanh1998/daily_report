import {Request, Response} from 'express';
import {getCollection} from '../config/mongo';
import {sendData, sendError} from '../ultil/ultil';
import {User} from "../models/users";
import {Teacher} from "../models/teacher";
import {School} from "../models/school";
import {Class} from "../models/class";

//danh sách trường của lãnh đạo
export const getListSchoolByPrincipal = async (req: Request, res: Response): Promise<any> => {
    try {
        const userID = parseInt(req.query.user_id as string, 10);
        const dataSchool = await School.findAll({
            attributes: ['id', 'name', 'type'],
            include: [
                {
                    model: User,
                    as: 'principals',
                    where: {id: userID},
                    attributes: [],
                    through: {attributes: []}
                }
            ]
        })
        sendData(res, dataSchool, 'Success');

    } catch (error) {
        res.status(500).json({error_code: 1, message: 'Failed'});
    }
};

// danh sách lớp giáo viên
export const getListClassByTeacher = async (req: Request, res: Response): Promise<any> => {
    try {
        const userID = parseInt(req.query.user_id as string, 10);
        const dataSchool = await Class.findAll({
            where: {teacher_id: userID},
            attributes: ['id', 'name',],
            include: [
                {
                    model: School,
                    as: 'school',
                    attributes: ['id', 'name', 'type'],
                }
            ]
        })
        sendData(res, dataSchool, 'Success');
    } catch (error) {
        res.status(500).json({error_code: 1, message: 'Failed'});
    }
};