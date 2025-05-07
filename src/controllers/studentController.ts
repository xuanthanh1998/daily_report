import {Request, Response} from 'express';
import {Student} from '../models/student';
import {sendData, sendError} from '../ultil/ultil';

//danh sách học sinh theo lớp
export const getListStudentByClass = async (req: Request, res: Response) => {
    try {
        if (!req.query.class_id) {
            return sendError(res,'class_id is required', 1);
        }
        const data = await Student.findAll({
            where: {class_id: req.query.class_id},

        });

        return sendData(res, data, 'Success');
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({message: 'Error fetching users', error});
    }
};


